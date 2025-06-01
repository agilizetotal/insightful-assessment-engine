
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface QuizResponseData {
  id: string;
  quiz_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  score: number | null;
  profile: string | null;
  completed_at: string | null;
  quizzes: {
    title: string;
  } | null;
}

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const exportAllResponses = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para exportar dados");
      return;
    }

    setIsExporting(true);
    try {
      console.log("Fetching all quiz responses for export...");
      
      // Buscar todas as respostas dos questionários do usuário
      const { data: responses, error } = await supabase
        .from('quiz_responses')
        .select(`
          id,
          quiz_id,
          user_name,
          user_email,
          user_phone,
          score,
          profile,
          completed_at,
          quizzes!inner(
            title,
            user_id
          )
        `)
        .eq('quizzes.user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error("Error fetching responses:", error);
        throw error;
      }

      if (!responses || responses.length === 0) {
        toast.info("Nenhuma resposta encontrada para exportar");
        return;
      }

      console.log(`Found ${responses.length} responses to export`);

      // Preparar dados para o Excel
      const excelData = responses.map((response: any, index: number) => ({
        'Nº': index + 1,
        'Questionário': response.quizzes?.title || 'N/A',
        'Nome': response.user_name || 'N/A',
        'Email': response.user_email || 'N/A',
        'Telefone': response.user_phone || 'N/A',
        'Score': response.score || 0,
        'Perfil': response.profile || 'N/A',
        'Data de Conclusão': response.completed_at 
          ? new Date(response.completed_at).toLocaleString('pt-BR')
          : 'N/A'
      }));

      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 5 },   // Nº
        { wch: 30 },  // Questionário
        { wch: 25 },  // Nome
        { wch: 35 },  // Email
        { wch: 20 },  // Telefone
        { wch: 10 },  // Score
        { wch: 25 },  // Perfil
        { wch: 20 }   // Data
      ];
      worksheet['!cols'] = columnWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas');

      // Gerar nome do arquivo com data atual
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `respostas_questionarios_${dateStr}.xlsx`;

      // Fazer download do arquivo
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Arquivo ${fileName} exportado com sucesso!`);
      console.log(`Excel export completed: ${fileName}`);
      
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Erro ao exportar dados para Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportAllResponses,
    isExporting
  };
};
