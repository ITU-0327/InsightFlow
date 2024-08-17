from InsightFlow.VectorDBInteractor import VectorDBInteractor
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans

class ClusteringPipeline:
    def __init__(self, vector_db_interactor: VectorDBInteractor):
        self.vector_db_interactor = vector_db_interactor

    def run_theme_clustering_pipeline(self, project_id):
        df = self._load_data(project_id)
        df = self._run_clustering(df)
        # df = self._label_theme_clusters(df)
        # self._update_vector_db(df)

    def run_persona_clustering_pipeline(self, project_id):
        df = self._load_data(project_id,suitable_for_persona="true")
        df = self._run_clustering(df,6)
        # df = self._label_persona_clusters(df)
        # self._update_vector_db(df)

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

    def _get_clusters(self, matrix, num_clusters): # WORKS
        kmeans = KMeans(n_clusters=num_clusters, init="k-means++", random_state=42)
        kmeans.fit(matrix)
        return kmeans.labels_

    # def _label_theme_clusters(self, df):
    #     return self._label_clusters(df, column_name='Theme')

    # def _label_persona_clusters(self, df):
    #     return self._label_clusters(df, column_name='Persona')

    # def _label_clusters(self, df, column_name):
    #     cluster_notes = df.groupby('Cluster')['note'].apply(lambda notes: ' '.join(notes)).reset_index()

    #     cluster_notes[column_name] = cluster_notes['note'].apply(self._generate_open_ai_summary)

    #     theme_map = dict(zip(cluster_notes['Cluster'], cluster_notes[column_name]))
    #     df[column_name.lower()] = df['Cluster'].map(theme_map)
        
    #     return df

    # def _generate_open_ai_summary(self, notes):
    #     response = OpenAI().ChatCompletion.create(
    #         model="gpt-3.5-turbo",
    #         messages=[
    #             {"role": "user", "content": f"Summarize the following notes: {notes}"}
    #         ]
    #     )
    #     return response.choices[0].message["content"].strip()

    # def _update_vector_db(self, df):
    #     for index, row in df.iterrows():
    #         response = self.vector_db_interactor.supabase_client.table(row["project_id"]).update({
    #             "theme": row["theme"],
    #             "clusterid": row["Cluster"]
    #         }).eq("id", row["id"]).execute()