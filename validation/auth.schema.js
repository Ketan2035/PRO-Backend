import { z } from "zod";

export const customerSignupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    mobile: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid mobile number"),
    city: z.string().min(2, "City is required"),
    address: z.string().optional(),
  }),
});

export const professionalSignupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    mob: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid mobile number"),
    profession: z.string().min(2, "Profession is required"),
    experience: z.coerce.number().min(0, "Experience cannot be negative"),
    qualification: z.string().min(2, "Qualification is required"),
    service_area: z.string().min(2, "Service area is required"),
    bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const addAddressSchema = z.object({
  body: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
  }),
});
