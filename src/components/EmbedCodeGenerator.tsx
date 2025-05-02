
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Check, Copy } from "lucide-react";
import { translations } from "@/locales/pt-BR";
import { toast } from "sonner";

interface EmbedCodeGeneratorProps {
  quizId: string;
}

export function EmbedCodeGenerator({ quizId }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  
  const hostUrl = window.location.origin;
  const embedCode = `
<div id="quiz-container-${quizId}" style="width:100%;max-width:800px;margin:0 auto;"></div>
<script>
  (function() {
    var container = document.getElementById('quiz-container-${quizId}');
    var iframe = document.createElement('iframe');
    iframe.src = '${hostUrl}/quiz/${quizId}';
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    container.appendChild(iframe);
    
    window.addEventListener('message', function(event) {
      if (event.origin !== '${hostUrl}') return;
      if (event.data.type === 'quiz-height') {
        iframe.style.height = event.data.height + 'px';
      }
    }, false);
  })();
</script>
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Código copiado com sucesso!");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Código de incorporação</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={embedCode}
          className="font-mono text-sm h-40"
          readOnly
        />
        <Button 
          onClick={handleCopy} 
          className="mt-4" 
          variant={copied ? "outline" : "default"}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copiar código
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
