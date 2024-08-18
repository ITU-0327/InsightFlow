#### **Inspiration**
The idea for InsightFlow was born out of the challenges Product Managers face daily: analyzing vast amounts of qualitative data from user research, which is often scattered across multiple sources. This not only consumes a significant amount of time but also makes onboarding new team members a lengthy process due to the fragmented data landscape. Furthermore, getting timely and accurate feedback on product features can be difficult, making it hard to gauge their impact.

InsightFlow is a latform designed to streamline the process of user research by automating the analysis of qualitative data. Unlike traditional methods that require hours of manual effort to organize, cluster, and analyze feedback, InsightFlow leverages LLM & Machine learning to transform raw data into meaningful insights quickly and efficiently. By reducing the time spent on tedious tasks, InsightFlow empowers founders , product managers and designers to make data driven decisions to build the next big thing!

#### **What We Learned**
In developing InsightFlow, we explored advanced data clustering techniques with K-means, natural language processing, and Retrieval-Augmented Generation (RAG). We uncovered the potential of AI to organize unstructured data into meaningful themes, drastically reducing the manual effort typically involved in data analysis.

#### **How We Built It**
InsightFlow was built using a combination of modern web technologies and AI frameworks. The backend was developed using Python, leveraging the LlamaIndex and OpenAI to process and analyze data. We integrated Supabase as our database solution to store and manage project data efficiently. The frontend was crafted with Next.JS, providing a responsive and user-friendly interface. Magic UI was employed to enhance the visual appeal and user experience.

Uploaded files are first ingested into Supabase's Vector Database, with automatic metadata extraction using LlamaIndex. These text chunks are then fed into our clustering pipeline to generate themes and personas, with labels assigned by large language models (LLMs). For the chat feature, we employ RAG and prompt engineering techniques, optimized with reranking to choose the best sources for responses. Refer to our architecture diagrams for a high-level overview.

#### **Challenges We Faced**
Clustering and data ingestion were initially slow, leading to poor user experience. To address this, we implemented asynchronous processes and multithreading to speed things up, and introduced Server-Sent Events (SSE) for real-time server-to-client communication. Although the backend isn't deployed yet due to time constraints, this is an area we wish we had tackled earlier.

---

**Built With:**
- **Languages:** Python, JavaScript
- **Frameworks:** Next.JS, LlamaIndex, FastAPI
- **Platforms:** Supabase (Authentication, PostgreSQL Database, Vector Database)
- **APIs:** OpenAI
- **Cloud Services:** AWS (Hosting, S3-compatible Storage)
- **UI Libraries:** Magic UI

---

### Video Demo

[Video Demo](https://youtu.be/_GWPIZEDfsk)

### DevPost Page

[InsightFlow](https://devpost.com/software/insightflow)
