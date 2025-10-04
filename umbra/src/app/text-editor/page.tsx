"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AppLayout } from "@/components/app-layout";

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState<string>(
    '# Title of the Research Paper\n\n**Author(s):** [Your Name(s)]  \n**Affiliation:** NASA Space Biology Program / [Institution]  \n**Date:** [Month Year]  \n\n---\n\n## Abstract\n\nSpace biology explores how the unique environment of space, including microgravity and radiation, affects biological systems. This study investigates [insert main research question], with the aim of advancing knowledge critical to human health and long-duration space exploration. Results are expected to contribute to the NASA Space Biology Knowledge Base (NASA-SBKB) and inform future missions to the Moon and Mars (NASA, 2023).\n\n---\n\n## Introduction\n\nThe study of life in space is a rapidly growing field, critical for understanding how organisms respond to spaceflight conditions. Biological responses to microgravity, radiation, and altered circadian rhythms may significantly impact human health during extended missions (Chakraborty et al., 2020).  \n\nPrevious experiments aboard the International Space Station (ISS) have demonstrated alterations in gene expression, immune function, and microbiome composition (Beheshti et al., 2019). However, significant knowledge gaps remain regarding long-term adaptation mechanisms.  \n\n**Objectives of this study:**  \n- To characterize the biological responses of [organism/tissue type] to microgravity.  \n- To analyze gene expression changes using multi-omics approaches.  \n- To assess implications for astronaut health and planetary exploration.  \n\n---\n\n## Materials and Methods\n\n### Experimental Design\nThis study will utilize [model organism/cell type], selected for its relevance to human physiology.  \n\n### Spaceflight Hardware\nBiological samples will be housed in [name of flight hardware] aboard the ISS, designed to support long-duration experiments in microgravity (NASA, 2022).  \n\n### Data Collection\n- **Genomic & transcriptomic analysis** using RNA sequencing.  \n- **Proteomic profiling** via mass spectrometry.  \n- **Physiological assays** for [e.g., immune response, metabolic rate].  \n\n### Statistical Analysis\nData will be analyzed using standard bioinformatics pipelines (e.g., DESeq2, edgeR) with significance thresholds set at *p* < 0.05 (Love et al., 2014).  \n\n---\n\n## Results (Placeholder)\n\nFindings will be presented in figures and tables.  \nFor example, preliminary gene expression analysis may reveal significant upregulation of stress-response genes in microgravity-exposed samples.  \n\n```python\n# Example: placeholder for gene expression analysis\nimport pandas as pd\n\ndata = pd.DataFrame({\n    \"Gene\": [\"TP53\", \"HSP70\", \"MYC\"],\n    \"Log2FC\": [1.8, 2.3, -1.1],\n    \"p_value\": [0.001, 0.045, 0.032]\n})\n\nprint(data)\n````\n\n---\n\n## Discussion\n\nThis study provides novel insights into how biological systems adapt to spaceflight. Upregulated stress-response pathways suggest mechanisms for coping with microgravity-induced cellular stress, consistent with previous reports (Beheshti et al., 2019).\n\nThese findings have direct implications for long-duration missions to Mars, where astronauts may face prolonged exposure to radiation and microgravity. Future studies should integrate ground-based analogs (e.g., clinostats, radiation chambers) with spaceflight data to validate observed responses (Chakraborty et al., 2020).\n\n---\n\n## Conclusion\n\nThis research advances our understanding of biological adaptation in space and contributes to the NASA Space Biology Knowledge Base. The insights gained are critical for safeguarding astronaut health and ensuring mission success during future lunar and Martian expeditions.\n\n---\n\n## References\n\n* Beheshti, A., et al. (2019). *Exploring the biological effects of spaceflight in microgravity: A systems biology perspective*. Frontiers in Genetics, 10, 1086. [https://doi.org/10.3389/fgene.2019.01086](https://doi.org/10.3389/fgene.2019.01086)\n\n* Chakraborty, N., et al. (2020). *Effects of microgravity on immune cell function and regulation*. npj Microgravity, 6, 5. [https://doi.org/10.1038/s41526-020-0097-6](https://doi.org/10.1038/s41526-020-0097-6)\n\n* Love, M. I., Huber, W., & Anders, S. (2014). *Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2*. Genome Biology, 15(12), 550. [https://doi.org/10.1186/s13059-014-0550-8](https://doi.org/10.1186/s13059-014-0550-8)\n\n* NASA. (2022). *NASA Space Biology Program: Flight Hardware*. NASA. Retrieved from [https://www.nasa.gov/space-biology](https://www.nasa.gov/space-biology)\n\n* NASA. (2023). *NASA Space Biology Knowledge Base (NASA-SBKB)*. NASA. Retrieved from [https://sbkb.nasa.gov](https://sbkb.nasa.gov)\n\n---\n\n> *This is a formal academic-style Markdown template intended for use in drafting NASA space biology research papers.*\n'
  );
  const [filename, setFilename] = useState<string>("untitled.md");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    toast.success("Markdown copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Markdown file downloaded!");
  };

  const handleSave = () => {
    // In a real app, this would save to a database or cloud storage
    toast.success("Markdown saved successfully!");
  };

  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = markdown;

    const newText =
      currentText.substring(0, start) +
      textToInsert +
      currentText.substring(end);
    setMarkdown(newText);

    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + textToInsert.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const insertHeading = () => insertAtCursor("\n# Heading\n");
  const insertBold = () => insertAtCursor("**bold text**");
  const insertItalic = () => insertAtCursor("*italic text*");
  const insertLink = () => insertAtCursor("[link text](url)");
  const insertImage = () => insertAtCursor("![alt text](image-url)");
  const insertList = () => insertAtCursor("\n- List item 1\n- List item 2\n");
  const insertCodeBlock = () => insertAtCursor("\n```\ncode here\n```\n");

  return (
    <AppLayout>
      <div className="container mx-auto py-1 px-4 max-w-10xl">
        <Toaster />
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl">
                  Umbra Research Editor
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Write, preview, and export your research documents
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="max-w-[200px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Button variant="outline" size="sm" onClick={insertHeading}>
                Heading
              </Button>
              <Button variant="outline" size="sm" onClick={insertBold}>
                Bold
              </Button>
              <Button variant="outline" size="sm" onClick={insertItalic}>
                Italic
              </Button>
              <Button variant="outline" size="sm" onClick={insertLink}>
                Link
              </Button>
              <Button variant="outline" size="sm" onClick={insertImage}>
                Image
              </Button>
              <Button variant="outline" size="sm" onClick={insertList}>
                List
              </Button>
              <Button variant="outline" size="sm" onClick={insertCodeBlock}>
                Code Block
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Editor</Label>
                <Textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  rows={24}
                  className="font-mono text-sm resize-none"
                  placeholder="Enter your markdown here..."
                />
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                        <h1
                          className="text-2xl font-bold mt-6 mb-4"
                          {...props}
                        />
                      ),
                      h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                        <h2
                          className="text-xl font-bold mt-5 mb-3"
                          {...props}
                        />
                      ),
                      h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
                        <h3
                          className="text-lg font-bold mt-4 mb-2"
                          {...props}
                        />
                      ),
                      p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
                        <p className="my-2 leading-relaxed" {...props} />
                      ),
                      ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
                        <ul
                          className="my-2 ml-6 list-disc space-y-1"
                          {...props}
                        />
                      ),
                      ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
                        <ol
                          className="my-2 ml-6 list-decimal space-y-1"
                          {...props}
                        />
                      ),
                      li: (props: React.HTMLAttributes<HTMLLIElement>) => (
                        <li className="ml-2" {...props} />
                      ),
                      blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
                        <blockquote
                          className="border-l-4 border-primary pl-4 py-1 my-2 italic text-muted-foreground"
                          {...props}
                        />
                      ),
                      code({ inline, ...props }: { inline?: boolean; children?: React.ReactNode; className?: string }) {
                        if (inline) {
                          return (
                            <code
                              className="bg-muted px-1 py-0.5 rounded text-sm"
                              {...props}
                            />
                          );
                        }
                        return (
                          <code
                            className="block bg-muted p-3 rounded text-sm my-2 overflow-x-auto"
                            {...props}
                          />
                        );
                      },
                      pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
                        <pre
                          className="bg-muted p-3 rounded text-sm my-2 overflow-x-auto"
                          {...props}
                        />
                      ),
                    }}>
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
