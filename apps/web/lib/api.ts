import axios from "axios";

export interface File{
    id: string;
    path: string;
    content: string;
}

const getFiles = async ({ projectId } : { projectId: string }): Promise<File[]> => {
    console.log("Hello from file", projectId);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${projectId}/files`);
    return response.data;
}

const startSandbox = async ({ projectId }: { projectId: string }): Promise<string> => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${projectId}/startSandbox`);
    console.log("Response from startSandbox API:", response.data);
    return response.data;
}

const createProject = async ({ prompt, userId }: { prompt: string, userId: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project`, {
        prompt,
        userId
    });
    return response.data;
}

const streamChat = async (projectId: string, payload: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${projectId}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: payload }),
    })

    if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
    }

    return response;
}

export { getFiles, startSandbox, createProject, streamChat };