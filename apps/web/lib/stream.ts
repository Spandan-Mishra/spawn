
const parseStream = async (reader: ReadableStreamDefaultReader, onChunk: (chunk: any) => void) => {
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";

    while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
            buffer += decoder.decode(value, { stream: true });
        }

        let items = buffer.split("\n\n");
        buffer = items.pop() || "";

        for (const item of items) {
            if (item.startsWith("data: ")) {
                const data = item.slice(6).trim();
                try {
                    const parsedData = JSON.parse(data);
                    onChunk(parsedData);
                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                }
            }
        }
        console.log("Stream parsing iteration complete");
    }
}

export { parseStream };