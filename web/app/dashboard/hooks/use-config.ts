// BACKEND_API_BASE_URL_DEV=http://localhost:8000/api
export interface ChatConfig {
  backend?: string;
  starterQuestions?: string[];
}

export function useClientConfig(): ChatConfig {
  const backendAPI = process.env.BACKEND_API_BASE_URL_DEV;
  //   const [config, setConfig] = useState<ChatConfig>();

  //   const backendOrigin = useMemo(() => {
  //     return chatAPI ? new URL(chatAPI).origin : "";
  //   }, [chatAPI]);

  //   const configAPI = `${backendOrigin}/api/chat/config`;

  //   useEffect(() => {
  //     fetch(configAPI)
  //       .then((response) => response.json())
  //       .then((data) => setConfig({ ...data, chatAPI }))
  //       .catch((error) => console.error("Error fetching config", error));
  //   }, [chatAPI, configAPI]);

  return {
    backend: backendAPI,
  };
}
