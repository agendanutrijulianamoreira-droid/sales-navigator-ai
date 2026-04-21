import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';

interface BrandKitProps {
  uploadUrl: string;
}

const BrandKit: React.FC<BrandKitProps> = ({ uploadUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2);
    
    if (!validMimeTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo inválido. Por favor, envie uma imagem (PNG, JPEG, WEBP).');
    }
    if (!validExtensions.includes('.' + fileExtension.toLowerCase())) {
      throw new Error('Extensão de arquivo inválida. Por favor, envie uma imagem com extensão válida (PNG, JPEG, WEBP).');
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        validateFile(selectedFile);
        setFile(selectedFile);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Sucesso
    } catch (err: any) {
      setError('Falha ao enviar o arquivo. Por favor, tente novamente.');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <input 
        type='file' 
        onChange={handleFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
      />
      {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
      <button 
        onClick={handleUpload}
        disabled={!file}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Upload
      </button>
    </div>
  );
};

export default BrandKit;