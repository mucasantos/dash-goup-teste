import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  onChange: (file: File | null) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, name, accept, onChange, error }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={handleFileChange}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

