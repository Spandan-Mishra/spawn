import axios from "axios";

export interface File{
    id: string;
    path: string;
    content: string;
}

const getFiles = async ({ projectId } : { projectId: string }): Promise<File[]> => {
    const response = await axios.get(`${process.env.BACKEND_URL}/project/${projectId}/files`);
    return response.data;
}

const startSandbox = async ({ projectId }: { projectId: string }): Promise<string> => {
    const response = await axios.post(`${process.env.BACKEND_URL}/project/${projectId}/startSandbox`);
    return response.data;
}

const createProject = async ({ prompt, userId }: { prompt: string, userId: string }) => {
    const response = await axios.post(`${process.env.BACKEND_URL}/project`, {
        prompt,
        userId
    });
    return response.data;
}

export { getFiles, startSandbox, createProject };