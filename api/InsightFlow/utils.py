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
    print(completion)
    
    return completion.choices[0].message.parsed