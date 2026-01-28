export interface CompileResource {
  path: string;
  content?: string;
  file?: string;
  main?: boolean;
}

export async function compileLatex(
  resources: CompileResource[],
): Promise<Uint8Array> {
  const response = await fetch("/api/compile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resources }),
  });

  if (!response.ok) {
    const data = await response.json();
    const message = data.details
      ? `${data.error}\n\n${data.details}`
      : data.error || "Compilation failed";
    throw new Error(message);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
