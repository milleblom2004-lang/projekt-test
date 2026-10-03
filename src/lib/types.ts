export type Role = "user" | "admin";

export interface Profile {
  id: string;
  display_name: string | null;
  email: string;
  created_at: string;
  role: Role;
  language: string;
  banned_at: string | null;
}

export interface Sighting {
  id: string;
  user_id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  place_name: string | null;
  country: string | null;
  sighted_at: string;
  description: string | null;
  created_at: string;
  hidden: boolean;
  consent_given_at: string;
  users?: { display_name: string | null } | null;
}

/** Columns safe to send to any visitor. */
export const PUBLIC_SIGHTING_COLUMNS =
  "id,user_id,image_url,latitude,longitude,place_name,country,sighted_at,description,created_at,hidden,users(display_name)";
