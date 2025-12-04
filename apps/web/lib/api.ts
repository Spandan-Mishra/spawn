import axios from "axios";

const getFiles = async ({ projectId } : { projectId: string }) => {
    const files = await axios.get(`${process.env.BACKEND_URL}/project/${projectId}/files`);
    return files;
}

const startSandbox = async ({ projectId }: { projectId: string }) => {
    const sandboxUrl = await axios.post(`${process.env.BACKEND_URL}/project/${projectId}/startSandbox`);
    return sandboxUrl;
}

const createProject = async ({ prompt, userId }: { prompt: string, userId: string }) => {
    const project = await axios.post(`${process.env.BACKEND_URL}/project`, {
        prompt,
        userId
    });
    return project;
}