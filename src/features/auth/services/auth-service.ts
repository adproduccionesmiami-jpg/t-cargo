import { createClient } from '@/lib/supabase/client'
import { AppUser } from '../types'

export const authService = {
    async getUserProfile(userId: string): Promise<AppUser | null> {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('auth_user_id', userId)
            .single()

        if (error) {
            console.error('Error fetching user profile:', error)
            return null
        }

        return data as AppUser
    },

    async signOut() {
        const supabase = createClient()
        await supabase.auth.signOut()
    }
}
