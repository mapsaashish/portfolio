import { createClient } from "@supabase/supabase-js";
const url="https://ltqqujtgoxgykyvhunky.supabase.co";
const key="sb_publishable_K5FUl7u2yNUEO9s-OHaMog_g071U7fJ";
export const supabase=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});