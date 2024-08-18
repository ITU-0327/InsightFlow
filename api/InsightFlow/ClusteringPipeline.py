import os
from InsightFlow.VectorDBInteractor import VectorDBInteractor
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from InsightFlow.utils import openai_summary
from pydantic import BaseModel
from supabase import Client
from asyncpg.pool import create_pool
from dotenv import load_dotenv

load_dotenv(".env.local")
SUPABASE_DB_CONN = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")


class PersonaDetails(BaseModel):
    Name: str
    PersonaTitle: str
    Demographics: str
    BehaviorPatterns: str
    PainPoints: str
    Goals: str
    Motivations: str
    ClusterID: int
    KeyNotes: str


class ClusteringPipeline:
    def __init__(self, vector_db_interactor: VectorDBInteractor, supabase_client: Client):
        self.vector_db_interactor = vector_db_interactor
        self.supabase_client = supabase_client

    async def run_theme_clustering_pipeline(self, project_id):
        df = self._load_data(project_id)
        df = self._run_clustering(df)
        df = self._label_clusters(df, "Theme")
        await self._update_vector_db_theme(df, project_id)
        return True

    async def run_persona_clustering_pipeline(self, project_id):
        df = self._load_data(project_id, suitable_for_persona="true")
        df = self._run_clustering(df, 6)
        df = self._label_persona_clusters(df)
        await self._update_vector_db_persona(df, project_id)
        return True

    def _load_data(self, project_id, suitable_for_persona=None):
        print("loading data")
        query = self.vector_db_interactor.get_base_query(project_id)
        if suitable_for_persona is not None:
            query = query.eq("metadata->suitable_for_persona", suitable_for_persona)

        response = query.execute()

        if response.data:
            return pd.DataFrame(response.data)
        else:
            print(f"Failed to retrieve data from Supabase: {response.status_code}, {response.error}")
            return pd.DataFrame()  # Return an empty DataFrame on failure

    def _run_clustering(self, df, max_clusters=11):
        print("_run_clustering")
        # prepare matrix
        matrix = np.vstack(df['vec'].apply(lambda x: np.array(eval(x))).values)

        # Calculate inertia values and determine optimal number of clusters
        inertia_values = []
        k_range = range(1, max_clusters)
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=0).fit(matrix)
            inertia_values.append(kmeans.inertia_)

        optimal_k = k_range[inertia_values.index(min(inertia_values))]

        # Assign clusters to DataFrame
        df["Cluster"] = self._get_clusters(matrix, optimal_k)
        return df

    @staticmethod
    def _get_clusters(matrix, num_clusters):  # WORKS
        kmeans = KMeans(n_clusters=num_clusters, init="k-means++", random_state=42)
        kmeans.fit(matrix)
        return kmeans.labels_

    # def _label_theme_clusters(self, df):
    #     return self._label_clusters(df, column_name='Theme')

    # def _label_persona_clusters(self, df):
    #     return self._label_clusters(df, column_name='Persona')

    def _label_clusters(self, df, column_name):
        print("_label_clusters")
        cluster_notes = df.groupby('Cluster')['note'].apply(lambda notes: ' '.join(notes)).reset_index()

        # I want to make this async so its faster
        label = [self._generate_theme_summary(notes) for notes in cluster_notes['note']]

        cluster_notes[column_name] = label

        # mapping
        theme_map = dict(zip(cluster_notes['Cluster'], cluster_notes[column_name]))
        df[column_name] = df['Cluster'].map(theme_map)

        return df

    def _label_persona_clusters(self, df):
        print("_label_persona_clusters")
        cluster_notes = df.groupby('Cluster')['note'].apply(lambda notes: ' '.join(notes)).reset_index()

        # Generate persona summaries for each cluster
        personas = [
            self._generate_persona_summary(notes, cluster_id)
            for cluster_id, notes in zip(cluster_notes['Cluster'], cluster_notes['note'])
        ]

        # Convert persona objects to a dictionary format and then to a DataFrame
        persona_df = pd.DataFrame([persona.model_dump() for persona in personas])

        return persona_df

    @staticmethod
    def _generate_theme_summary(notes: object) -> object:
        response = openai_summary(
            system_prompt="You are an expert UX researcher. You will be given a notes cluster for affinity mapping "
                          "and should write a theme (no more than 20 words) that's useful for UX",
            user_prompt=notes
        )
        return response.response

    @staticmethod
    def _generate_persona_summary(notes: str, cluster_id: int) -> PersonaDetails:
        system_prompt = (
            "You are an expert in user experience (UX) research and persona creation. "
            "Your task is to analyze a cluster of notes and generate a comprehensive persona. "
            "The persona should include the following sections: "
            "1. Name: A fictional name that represents the persona. "
            "2. Persona Title: A concise title that summarizes the persona. "
            "3. Demographics: Details like age, gender, occupation, location, etc. "
            "4. Behavior Patterns: Key behaviors, habits, and preferences. "
            "5. Pain Points: Challenges and issues the persona commonly faces. "
            "6. Goals: What the persona aims to achieve in their personal and professional life. "
            "7. Motivations: The driving forces behind the persona's decisions and actions. "
            "8. Key Notes: A summary of the most important insights about the persona. "
            "Keep the persona details concise and to the point, focusing on information that would be most useful for "
            "UX design."
            "Here is an example of a well-structured persona:\n"
            "Name: Alex Johnson\n"
            "Persona Title: Tech-Savvy Millennial\n"
            "Demographics: Age 25-35, primarily male, urban dwellers\n"
            "Behavior Patterns: Prefers online shopping, heavy social media user, early adopter of technology\n"
            "Pain Points: Struggles with balancing work-life, desires better financial planning tools\n"
            "Goals: Wants to advance in career, achieve financial stability, maintain a healthy lifestyle\n"
            "Motivations: Driven by the need to stay ahead of trends, values convenience and efficiency\n"
            "Key Notes: Interested in tech innovations, values work-life balance, looking for better budgeting tools"
        )

        user_prompt = (
            "Below is a cluster of notes collected from various user interviews and observations. "
            "Please analyze these notes and generate a persona following the structure provided in the instructions. "
            "Make sure to summarize the key insights in each section concisely.\n\n"
            f"Notes: {notes}"
        )

        persona_details = openai_summary(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=PersonaDetails
        )

        # Manually assign the cluster ID since it's not generated by OpenAI
        persona_details.ClusterID = cluster_id
        return persona_details

    @staticmethod
    async def _update_vector_db_theme(theme_df, project_id):
        """
        Updates the themes table in the database with the generated theme DataFrame asynchronously.

        Args:
            theme_df (pd.DataFrame): The DataFrame containing the theme information.
            project_id (str): The ID of the project associated with these themes.
        """
        try:
            # Create a connection pool
            pool = await create_pool(dsn=SUPABASE_DB_CONN, statement_cache_size=0)

            async with pool.acquire() as conn:
                # Iterate over each row in the Theme DataFrame
                for _, row in theme_df.iterrows():
                    # Dynamically create the SQL query string with the project_id as the table name
                    query = f"""
                        UPDATE vecs."{project_id}"
                        SET theme = $1, cluster_id = $2
                        WHERE id = $3
                    """
                    # Asynchronously update the theme data in the Supabase table
                    await conn.execute(query, row.get("Theme"), row.get("Cluster"), row.get("id"))

            # Close the connection pool
            await pool.close()
            print(f"Successfully updated theme data for project {project_id}")

        except Exception as e:
            print(f"An error occurred while updating the themes table: {e}")

    @staticmethod
    async def _update_vector_db_persona(persona_df, project_id):
        """
        Updates the personas table in the database with the generated persona DataFrame asynchronously.

        Args:
            persona_df (pd.DataFrame): The DataFrame containing the persona information.
            project_id (str): The ID of the project associated with these personas.
        """
        try:
            pool = await create_pool(dsn=SUPABASE_DB_CONN, statement_cache_size=0)

            async with pool.acquire() as conn:
                # Iterate over each row in the Persona DataFrame
                for _, row in persona_df.iterrows():
                    # Create a dictionary of persona details from the DataFrame
                    persona_data = {
                        "project_id": project_id,
                        "name": row.get("Name"),
                        "persona_title": row.get("PersonaTitle"),
                        "demographics": row.get("Demographics"),
                        "behavior_patterns": row.get("BehaviorPatterns"),
                        "pain_points": row.get("PainPoints"),
                        "goals": row.get("Goals"),
                        "motivations": row.get("Motivations"),
                        "cluster_id": row.get("ClusterID"),
                        "key_notes": row.get("KeyNotes"),
                    }

                    # Asynchronously insert the persona data into the Supabase table
                    await conn.execute("""
                        INSERT INTO public.personas (project_id, name, persona_title, demographics, behavior_patterns, 
                        pain_points, goals, motivations, cluster_id, key_notes)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    """, project_id, persona_data["name"], persona_data["persona_title"], persona_data["demographics"],
                                       persona_data["behavior_patterns"], persona_data["pain_points"],
                                       persona_data["goals"], persona_data["motivations"], persona_data["cluster_id"],
                                       persona_data["key_notes"])

            # Close the database connection
            await pool.close()
            print(f"Successfully inserted persona data for project {project_id}")

        except Exception as e:
            print(f"An error occurred while updating the personas table: {e}")
