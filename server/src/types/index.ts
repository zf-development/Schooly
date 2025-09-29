export interface SupabaseUser {
    id: string;
    email: string;
    institution_id: string;
    display_name?: string;
    full_name?: string;
    avatar_url?: string;
    file_number?: string;
    school?: string;
    group_number?: string;
    education_level?: string;
    preferred_tags?: string[];
    academic_projects?: string[];
    created_at: string;
}

export interface SupabaseInstitution {
    id: string;
    name: string;
    type: 'university' | 'college' | 'high_school';
    is_active: boolean;
    created_at: string;
}

export interface SupabaseFeedPost {
    id: string;
    title: string;
    content: string;
    visibility: string;
    author_id: string;
    institution_id: string;
    created_at: string;
    updated_at?: string;
    hashtags?: string[];
}

export interface SupabaseUserBadge {
    badge_id: string;
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    badge_color: string;
    unlocked: boolean;
    unlocked_at?: string;
}

export interface SupabaseCalendarEvent {
    id: string;
    title: string;
    description?: string;
    start_date: Date;
    end_date: Date;
    location?: string;
    attendees?: string[];
    type: 'academic' | 'personal' | 'institution';
    reminder?: boolean;
    created_by: string;
    created_at: Date;
}