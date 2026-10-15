export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["author_id"];
          },
        ];
      };
      settings: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["category_id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;
          cover_image: string | null;
          cover_alt: string | null;
          category_id: string | null;
          author_id: string | null;
          tags: string[];
          status: string;
          is_featured: boolean;
          reading_minutes: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content?: string;
          cover_image?: string | null;
          cover_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          tags?: string[];
          status?: string;
          is_featured?: boolean;
          reading_minutes?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string | null;
          content?: string;
          cover_image?: string | null;
          cover_alt?: string | null;
          category_id?: string | null;
          author_id?: string | null;
          tags?: string[];
          status?: string;
          is_featured?: boolean;
          reading_minutes?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      albums: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          cover_photo: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          cover_photo?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          cover_photo?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["album_id"];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          album_id: string | null;
          title: string | null;
          caption: string | null;
          image_path: string;
          alt_text: string | null;
          width: number | null;
          height: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id?: string | null;
          title?: string | null;
          caption?: string | null;
          image_path: string;
          alt_text?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string | null;
          title?: string | null;
          caption?: string | null;
          image_path?: string;
          alt_text?: string | null;
          width?: number | null;
          height?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id"];
          },
        ];
      };
      videos: {
        Row: {
          id: string;
          youtube_id: string;
          youtube_url: string;
          title: string;
          description: string | null;
          category: string | null;
          duration_seconds: number | null;
          is_featured: boolean;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          youtube_url: string;
          title: string;
          description?: string | null;
          category?: string | null;
          duration_seconds?: number | null;
          is_featured?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          youtube_id?: string;
          youtube_url?: string;
          title?: string;
          description?: string | null;
          category?: string | null;
          duration_seconds?: number | null;
          is_featured?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Post = Tables<"posts">;
export type Photo = Tables<"photos">;
export type Video = Tables<"videos">;
export type Album = Tables<"albums">;
export type Category = Tables<"categories">;
export type Profile = Tables<"profiles">;
export type ContactMessage = Tables<"contact_messages">;
export type SiteSetting = Tables<"settings">;