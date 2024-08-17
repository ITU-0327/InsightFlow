import json
import re
import os
import aiohttp
import openai
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv
from urllib.parse import urlparse

from pydantic import BaseModel

load_dotenv(".env.local")
SUPABASE_DB_CONN: str = os.environ.get("PUBLIC_SUPABASE_DB_CONN_URL")
openai = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def file_name_formatter(file_name: str) -> str:
    """
    Format the file name by removing spaces and illegal characters.

    Args:
        file_name (str): The original file name.

    Returns:
        str: The formatted file name.
    """
    file_name = file_name.strip()
    file_name = file_name.replace(" ", "_")
    file_name = re.sub(r'[^\w\-.]', '', file_name)
    return file_name


def create_project_vec_table(project_id: str):
    try:
        # Connect to the PostgresSQL database
        conn = psycopg2.connect(SUPABASE_DB_CONN)
        cur = conn.cursor()

        # Define the table name
        table_name = sql.Identifier(f"{project_id}")

        # SQL command to create a table
        create_table_query = sql.SQL("""
        CREATE TABLE IF NOT EXISTS vecs.{table_name} (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            vec vector(1536),  -- Adjust the dimension size of the vector as needed
            metadata jsonb,
            theme text,
            cluster_id int8,
            persona_id uuid,
            created_at timestamp with time zone DEFAULT now()
        );
        """).format(table_name=table_name)

        # Execute the SQL command
        cur.execute(create_table_query)

        # Commit the changes
        conn.commit()

        # Close communication with the database
        cur.close()
        conn.close()

        print(f"Table {table_name.string} created successfully.")

    except Exception as e:
        print(f"An error occurred while creating the table {project_id}: {e}")


async def _download_file(url: str, dest_folder: str):
    parsed_url = urlparse(url)
    clean_url = parsed_url._replace(query="").geturl()
    filename = clean_url.split('/')[-1].replace(" ", "_")
    file_path = os.path.join(dest_folder, filename)
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as r:
            r.raise_for_status()
            with open(file_path, 'wb') as f:
                while True:
                    chunk = await r.content.read(1024 * 8)
                    if not chunk:
                        break
                    f.write(chunk)
                    f.flush()
                    os.fsync(f.fileno())


class DefaultResponse(BaseModel):
    response: str


def openai_summary(system_prompt, user_prompt, response_model=DefaultResponse):
    completion = openai.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",  # Replace it with the appropriate model version
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=response_model,  # Use the defined schema
        )
    return completion.choices[0].message.parsed


def select_group_by_themes(project_id: str, limit_per_theme: int = 10):
    grouped_results = {}

    sql_query = f"""
    WITH RankedNotes AS (
        SELECT
            cluster_id,
            theme,
            metadata->>'note' AS note,
            metadata->'tags' AS tags,
            metadata->>'file_name' AS file_name,
            metadata->>'_node_content' AS node_content,
            ROW_NUMBER() OVER (PARTITION BY theme ORDER BY cluster_id) AS rn
        FROM vecs."{project_id}"
        WHERE theme IS NOT NULL AND theme <> ''
    )
    SELECT
        cluster_id,
        theme,
        note,
        tags,
        file_name,
        node_content
    FROM RankedNotes
    WHERE rn <= %s;
    """

    try:
        # Connect to PostgresSQL
        conn = psycopg2.connect(dsn=SUPABASE_DB_CONN)
        cursor = conn.cursor()

        # Execute the query
        cursor.execute(sql_query, (limit_per_theme,))
        rows = cursor.fetchall()

        # Organize the results into grouped_results dictionary
        for row in rows:
            theme = row[1]  # Access by index
            if theme not in grouped_results:
                grouped_results[theme] = {"data": []}

            # Parse the `_node_content` JSON and extract the `text` field
            node_content = json.loads(row[5])
            text_content = node_content.get('text', '')  # Extract the 'text' field

            # Add the row data to the grouped_results dictionary
            grouped_results[theme]["data"].append({
                "theme": row[1],
                "note": row[2],
                "tags": row[3],
                "file_name": row[4],
                "text_content": text_content  # Add the extracted text content
            })

        # Close the connection
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"An error occurred: {e}")

    return grouped_results
