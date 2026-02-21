import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSiteContent(sectionKey: string) {
  return useQuery({
    queryKey: ["site_content", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content" as any)
        .select("content")
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (error) throw error;
      return (data as any)?.content || null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllSiteContent() {
  return useQuery({
    queryKey: ["site_content", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content" as any)
        .select("*")
        .order("section_key");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data as any[])?.forEach((row: any) => {
        map[row.section_key] = row.content;
      });
      return map;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionKey, content }: { sectionKey: string; content: any }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("site_content" as any)
        .update({ content, updated_by: session?.user?.id || null } as any)
        .eq("section_key", sectionKey);
      if (error) throw error;
    },
    onSuccess: (_, { sectionKey }) => {
      queryClient.invalidateQueries({ queryKey: ["site_content"] });
      toast.success(`${sectionKey} content updated`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update content");
    },
  });
}
