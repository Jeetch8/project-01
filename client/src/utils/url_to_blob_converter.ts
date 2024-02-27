export const urlToBlobConverter = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const result = event.target?.result; // Type is string | ArrayBuffer | null

      if (result instanceof ArrayBuffer) {
        const blob = new Blob([result], { type: file.type });
        resolve(blob);
      } else {
        reject(new Error("Failed to convert file to blob"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file); // Read as ArrayBuffer to create Blob
  });
};

export const blobToFile = (blob: Blob, fileName: string) => {
  return new File([blob], fileName, { type: blob.type });
};

// export const blobToFile = (theBlob:Blob, fileName:string) => {
//   theBlob.lastModifiedDate = new Date();
//   theBlob.name = fileName;
//   return theBlob;
// };
