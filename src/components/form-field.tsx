"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldProps {
  label: string;
  id: string;
  type?: "text" | "email" | "number" | "tel" | "date" | "textarea" | "select";
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
}

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required,
  options = [],
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${error ? "border-destructive" : ""}`}
          rows={4}
        />
      ) : type === "select" ? (
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger
            id={id}
            className={`w-full ${error ? "border-destructive" : ""}`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full ${error ? "border-destructive" : ""}`}
        />
      )}

      {error && (
        <p className="text-destructive">{error}</p>
      )}

      {helperText && !error && (
        <p className="text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

