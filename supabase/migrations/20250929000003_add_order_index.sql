-- Ajouter la colonne order_index pour gérer l'ordre des éléments
ALTER TABLE public.pages
ADD COLUMN order_index integer DEFAULT 0;

-- Index pour améliorer les performances des requêtes d'ordre
CREATE INDEX idx_pages_order_index ON public.pages(order_index);

-- Mettre à jour les pages existantes avec un order_index basé sur created_at
UPDATE public.pages 
SET order_index = (
    SELECT ROW_NUMBER() OVER (
        PARTITION BY COALESCE(parent_id, 'root') 
        ORDER BY created_at
    ) - 1
    FROM (
        SELECT id, parent_id, created_at,
               ROW_NUMBER() OVER (
                   PARTITION BY COALESCE(parent_id, 'root') 
                   ORDER BY created_at
               ) as rn
        FROM public.pages
    ) ranked
    WHERE ranked.id = pages.id
);

