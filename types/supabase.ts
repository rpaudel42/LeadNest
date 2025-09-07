export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_profiles: {
        Row: {
          address1: string | null
          address2: string | null
          business_name: string
          city: string | null
          contact_person: string | null
          created_at: string | null
          ein: string | null
          email: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"] | null
          phone: string | null
          state: string | null
          user_id: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          business_name?: string
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          ein?: string | null
          email?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          phone?: string | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address1?: string | null
          address2?: string | null
          business_name?: string
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          ein?: string | null
          email?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"] | null
          phone?: string | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          checksum: string | null
          content_id: string
          created_at: string | null
          duration_sec: number | null
          format: string | null
          height: number | null
          id: string
          metadata: Json | null
          order_index: number | null
          size_bytes: number | null
          storage_path: string
          width: number | null
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          checksum?: string | null
          content_id: string
          created_at?: string | null
          duration_sec?: number | null
          format?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          order_index?: number | null
          size_bytes?: number | null
          storage_path: string
          width?: number | null
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          checksum?: string | null
          content_id?: string
          created_at?: string | null
          duration_sec?: number | null
          format?: string | null
          height?: number | null
          id?: string
          metadata?: Json | null
          order_index?: number | null
          size_bytes?: number | null
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_candidates: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          rank: number
          text_variant: string | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rank: number
          text_variant?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rank?: number
          text_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_candidates_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_metrics: {
        Row: {
          avg_watch_time_sec: number | null
          clicks: number | null
          collected_at: string
          comments: number | null
          id: number
          impressions: number | null
          likes: number | null
          platform_target_id: string
          raw: Json | null
          reach: number | null
          saves: number | null
          shares: number | null
          video_views: number | null
        }
        Insert: {
          avg_watch_time_sec?: number | null
          clicks?: number | null
          collected_at?: string
          comments?: number | null
          id?: number
          impressions?: number | null
          likes?: number | null
          platform_target_id: string
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          video_views?: number | null
        }
        Update: {
          avg_watch_time_sec?: number | null
          clicks?: number | null
          collected_at?: string
          comments?: number | null
          id?: number
          impressions?: number | null
          likes?: number | null
          platform_target_id?: string
          raw?: Json | null
          reach?: number | null
          saves?: number | null
          shares?: number | null
          video_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_metrics_platform_target_id_fkey"
            columns: ["platform_target_id"]
            isOneToOne: false
            referencedRelation: "content_platform_targets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_metrics_platform_target_id_fkey"
            columns: ["platform_target_id"]
            isOneToOne: false
            referencedRelation: "v_due_targets"
            referencedColumns: ["target_id"]
          },
        ]
      }
      content_moderation_flags: {
        Row: {
          confidence: number | null
          content_id: string
          created_at: string | null
          id: string
          label: string | null
          notes: string | null
          source: string | null
        }
        Insert: {
          confidence?: number | null
          content_id: string
          created_at?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          source?: string | null
        }
        Update: {
          confidence?: number | null
          content_id?: string
          created_at?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_moderation_flags_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_platform_targets: {
        Row: {
          allow_crosspost: boolean | null
          caption_override: string | null
          content_id: string
          cover_asset_id: string | null
          created_at: string | null
          destination_id: string
          destination_label: string | null
          external_post_id: string | null
          external_url: string | null
          first_comment: string | null
          hashtags: string[] | null
          id: string
          last_error: string | null
          location_tag: string | null
          mentions: string[] | null
          platform: Database["public"]["Enums"]["platform_type"]
          published_at: string | null
          retries: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["publish_status"]
          updated_at: string | null
        }
        Insert: {
          allow_crosspost?: boolean | null
          caption_override?: string | null
          content_id: string
          cover_asset_id?: string | null
          created_at?: string | null
          destination_id: string
          destination_label?: string | null
          external_post_id?: string | null
          external_url?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          last_error?: string | null
          location_tag?: string | null
          mentions?: string[] | null
          platform: Database["public"]["Enums"]["platform_type"]
          published_at?: string | null
          retries?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
        }
        Update: {
          allow_crosspost?: boolean | null
          caption_override?: string | null
          content_id?: string
          cover_asset_id?: string | null
          created_at?: string | null
          destination_id?: string
          destination_label?: string | null
          external_post_id?: string | null
          external_url?: string | null
          first_comment?: string | null
          hashtags?: string[] | null
          id?: string
          last_error?: string | null
          location_tag?: string | null
          mentions?: string[] | null
          platform?: Database["public"]["Enums"]["platform_type"]
          published_at?: string | null
          retries?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_platform_targets_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_platform_targets_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_preferences: {
        Row: {
          approval_required: boolean | null
          audience: string | null
          banned_hashtags: string[] | null
          business_id: string | null
          categories: string[]
          content_type: string
          created_at: string | null
          emoji_style: string | null
          frequency: number | null
          geo_focus: string | null
          hashtags: string | null
          id: string
          idea: string | null
          ideas: string | null
          name: string | null
          platforms: string[] | null
          preferred_hashtags: string[] | null
          preferred_times: string[] | null
          timezone: string | null
          tone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approval_required?: boolean | null
          audience?: string | null
          banned_hashtags?: string[] | null
          business_id?: string | null
          categories?: string[]
          content_type?: string
          created_at?: string | null
          emoji_style?: string | null
          frequency?: number | null
          geo_focus?: string | null
          hashtags?: string | null
          id?: string
          idea?: string | null
          ideas?: string | null
          name?: string | null
          platforms?: string[] | null
          preferred_hashtags?: string[] | null
          preferred_times?: string[] | null
          timezone?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approval_required?: boolean | null
          audience?: string | null
          banned_hashtags?: string[] | null
          business_id?: string | null
          categories?: string[]
          content_type?: string
          created_at?: string | null
          emoji_style?: string | null
          frequency?: number | null
          geo_focus?: string | null
          hashtags?: string | null
          id?: string
          idea?: string | null
          ideas?: string | null
          name?: string | null
          platforms?: string[] | null
          preferred_hashtags?: string[] | null
          preferred_times?: string[] | null
          timezone?: string | null
          tone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_preferences_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          alt_text: string | null
          aspect_ratio: Database["public"]["Enums"]["aspect_ratio_type"]
          campaign_id: string | null
          caption: string | null
          categories: string[]
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          duration_sec: number | null
          emoji_style: string | null
          first_comment: string | null
          id: string
          idea: string | null
          link_url: string | null
          moderation_notes: string | null
          moderation_status: string | null
          platforms: string[]
          preference_id: string | null
          prompt: Json | null
          published_at: string | null
          requires_audio: boolean | null
          scheduled_at: string | null
          source_model: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          timezone: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratio_type"]
          campaign_id?: string | null
          caption?: string | null
          categories?: string[]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          duration_sec?: number | null
          emoji_style?: string | null
          first_comment?: string | null
          id?: string
          idea?: string | null
          link_url?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          platforms?: string[]
          preference_id?: string | null
          prompt?: Json | null
          published_at?: string | null
          requires_audio?: boolean | null
          scheduled_at?: string | null
          source_model?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: Database["public"]["Enums"]["aspect_ratio_type"]
          campaign_id?: string | null
          caption?: string | null
          categories?: string[]
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          duration_sec?: number | null
          emoji_style?: string | null
          first_comment?: string | null
          id?: string
          idea?: string | null
          link_url?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          platforms?: string[]
          preference_id?: string | null
          prompt?: Json | null
          published_at?: string | null
          requires_audio?: boolean | null
          scheduled_at?: string | null
          source_model?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          action_link: string | null
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          invite_type: string | null
          meta: Json | null
          status: string | null
          token: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_type?: string | null
          meta?: Json | null
          status?: string | null
          token: string
        }
        Update: {
          action_link?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_type?: string | null
          meta?: Json | null
          status?: string | null
          token?: string
        }
        Relationships: []
      }
      post_engagements: {
        Row: {
          captured_at: string | null
          comments: number | null
          id: string
          impressions: number | null
          likes: number | null
          post_id: string | null
          shares: number | null
        }
        Insert: {
          captured_at?: string | null
          comments?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          shares?: number | null
        }
        Update: {
          captured_at?: string | null
          comments?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string | null
          shares?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_engagements_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          business_id: string | null
          caption: string | null
          created_at: string | null
          id: string
          image_url: string | null
          platform: string | null
          published_at: string | null
          scheduled_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          platform?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          platform?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          account_id: string
          created_at: string | null
          display_name: string | null
          expires_at: string | null
          handle: string | null
          id: string
          last_error: string | null
          picture_url: string | null
          provider: Database["public"]["Enums"]["social_provider"]
          refresh_token: string | null
          scopes: string[] | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_id: string
          created_at?: string | null
          display_name?: string | null
          expires_at?: string | null
          handle?: string | null
          id?: string
          last_error?: string | null
          picture_url?: string | null
          provider: Database["public"]["Enums"]["social_provider"]
          refresh_token?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_id?: string
          created_at?: string | null
          display_name?: string | null
          expires_at?: string | null
          handle?: string | null
          id?: string
          last_error?: string | null
          picture_url?: string | null
          provider?: Database["public"]["Enums"]["social_provider"]
          refresh_token?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_due_targets: {
        Row: {
          access_token: string | null
          base_caption: string | null
          caption_override: string | null
          content_id: string | null
          content_type: Database["public"]["Enums"]["content_type"] | null
          destination_id: string | null
          expires_at: string | null
          platform: Database["public"]["Enums"]["platform_type"] | null
          provider: Database["public"]["Enums"]["social_provider"] | null
          refresh_token: string | null
          scheduled_at: string | null
          social_account_id: string | null
          status: Database["public"]["Enums"]["publish_status"] | null
          target_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_platform_targets_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      digits_only: {
        Args: { t: string }
        Returns: string
      }
    }
    Enums: {
      account_status: "connected" | "expired" | "revoked" | "error"
      aspect_ratio_type:
        | "1:1"
        | "4:5"
        | "16:9"
        | "9:16"
        | "3:2"
        | "21:9"
        | "unknown"
      asset_type:
        | "image"
        | "video"
        | "thumbnail"
        | "audio"
        | "subtitle"
        | "project"
      content_status:
        | "draft"
        | "generating"
        | "ready"
        | "scheduled"
        | "publishing"
        | "published"
        | "failed"
        | "canceled"
      content_type:
        | "text"
        | "image"
        | "video"
        | "carousel"
        | "story"
        | "reel"
        | "short"
      industry_type:
        | "Real Estate"
        | "Technology"
        | "Healthcare"
        | "Finance"
        | "Restaurant"
        | "Education"
        | "Retail"
        | "Automotive"
        | "Fitness"
        | "Other"
      platform_type:
        | "instagram"
        | "facebook"
        | "linkedin"
        | "tiktok"
        | "x"
        | "youtube"
        | "youtube_shorts"
        | "pinterest"
      publish_status:
        | "pending"
        | "ready"
        | "scheduled"
        | "publishing"
        | "published"
        | "failed"
        | "canceled"
      social_provider:
        | "instagram"
        | "facebook"
        | "linkedin"
        | "tiktok"
        | "x"
        | "youtube"
        | "pinterest"
        | "mock"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["connected", "expired", "revoked", "error"],
      aspect_ratio_type: [
        "1:1",
        "4:5",
        "16:9",
        "9:16",
        "3:2",
        "21:9",
        "unknown",
      ],
      asset_type: [
        "image",
        "video",
        "thumbnail",
        "audio",
        "subtitle",
        "project",
      ],
      content_status: [
        "draft",
        "generating",
        "ready",
        "scheduled",
        "publishing",
        "published",
        "failed",
        "canceled",
      ],
      content_type: [
        "text",
        "image",
        "video",
        "carousel",
        "story",
        "reel",
        "short",
      ],
      industry_type: [
        "Real Estate",
        "Technology",
        "Healthcare",
        "Finance",
        "Restaurant",
        "Education",
        "Retail",
        "Automotive",
        "Fitness",
        "Other",
      ],
      platform_type: [
        "instagram",
        "facebook",
        "linkedin",
        "tiktok",
        "x",
        "youtube",
        "youtube_shorts",
        "pinterest",
      ],
      publish_status: [
        "pending",
        "ready",
        "scheduled",
        "publishing",
        "published",
        "failed",
        "canceled",
      ],
      social_provider: [
        "instagram",
        "facebook",
        "linkedin",
        "tiktok",
        "x",
        "youtube",
        "pinterest",
        "mock",
      ],
    },
  },
} as const
