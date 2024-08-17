import { useClientConfig } from "../hooks/use-config";

export interface Persona {
  name: string;
  personaId: string;
  personaTitle: string;
  demographics: string;
  behavior: string;
  painPoints: string;
  goals: string;
  motivations: string;
  key_notes: string;
}

export const getPersonas = async (
  project_id: string = "PROJECT_ID_NOT_DEFINED"
): Promise<Persona[]> => {
  const { backend } = useClientConfig();
  try {
    const response = await fetch(
      `${backend}/projects/${project_id}/personas/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const result = await response.json();
    return result.data.map((person: any) => ({
      name: person.name,
      personaId: person.id,
      personaTitle: person.persona_title,
      demographics: person.demographics,
      behavior: person.behavior_patterns,
      painPoints: person.pain_points,
      goals: person.goals,
      motivations: person.motivations,
      key_notes: person.key_notes,
    }));
  } catch (error) {
    console.error("Error fetching persona for proj:", project_id, error);
    throw error;
  }
};
