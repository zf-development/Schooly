import jsPDF from 'jspdf';

export const convertEditorContentToPDF = (content: any, title: string): void => {
    try {
        // Créer un nouveau document PDF
        const doc = new jsPDF();

        // Configuration de base
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        // Ajouter le titre
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(title, maxWidth);
        doc.text(titleLines, margin, margin);

        let yPosition = { current: margin + titleLines.length * 8 + 10 };

        // Traiter le contenu Editor.js
        if (content && content.blocks && Array.isArray(content.blocks)) {
            // Format Editor.js
            content.blocks.forEach((block: any) => {
                if (yPosition.current > pageHeight - 30) {
                    doc.addPage();
                    yPosition.current = margin;
                }

                switch (block.type) {
                    case 'header': {
                        const level = block.data?.level || 1;
                        const headerSize = Math.max(16 - (level - 1) * 2, 10);
                        doc.setFontSize(headerSize);
                        doc.setFont('helvetica', 'bold');
                        const headerText = block.data?.text || '';
                        if (headerText.trim()) {
                            const lines = doc.splitTextToSize(headerText, maxWidth);
                            doc.text(lines, margin, yPosition.current);
                            yPosition.current += lines.length * (headerSize * 0.4) + 5;
                        }
                        break;
                    }

                    case 'paragraph': {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        const paragraphText = block.data?.text || '';
                        if (paragraphText.trim()) {
                            const lines = doc.splitTextToSize(paragraphText, maxWidth);
                            doc.text(lines, margin, yPosition.current);
                            yPosition.current += lines.length * 5 + 5;
                        } else {
                            yPosition.current += 10;
                        }
                        break;
                    }

                    case 'list': {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        const items = block.data?.items || [];
                        items.forEach((item: any, index: number) => {
                            if (yPosition.current > pageHeight - 30) {
                                doc.addPage();
                                yPosition.current = margin;
                            }
                            const itemText = typeof item === 'string' ? item : (item.text || '');
                            const prefix = block.data?.style === 'ordered' ? `${index + 1}. ` : '• ';
                            const listText = `${prefix}${itemText}`;
                            const lines = doc.splitTextToSize(listText, maxWidth - 10);
                            doc.text(lines, margin + 10, yPosition.current);
                            yPosition.current += lines.length * 5 + 3;
                        });
                        yPosition.current += 5;
                        break;
                    }

                    case 'checklist': {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        const items = block.data?.items || [];
                        items.forEach((item: any) => {
                            if (yPosition.current > pageHeight - 30) {
                                doc.addPage();
                                yPosition.current = margin;
                            }
                            const itemText = item.text || '';
                            const isChecked = item.checked || false;
                            const checkbox = isChecked ? '[X]' : '[ ]';
                            const taskText = `${checkbox} ${itemText}`;
                            const lines = doc.splitTextToSize(taskText, maxWidth - 10);
                            doc.text(lines, margin + 10, yPosition.current);
                            yPosition.current += lines.length * 5 + 3;
                        });
                        yPosition.current += 5;
                        break;
                    }

                    case 'quote': {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'italic');
                        const quoteText = block.data?.text || '';
                        if (quoteText.trim()) {
                            const lines = doc.splitTextToSize(quoteText, maxWidth - 20);
                            doc.text(lines, margin + 10, yPosition.current);
                            yPosition.current += lines.length * 5 + 5;
                        }
                        break;
                    }

                    case 'code': {
                        doc.setFontSize(10);
                        doc.setFont('courier', 'normal');
                        const codeText = block.data?.code || '';
                        if (codeText.trim()) {
                            const lines = doc.splitTextToSize(codeText, maxWidth - 10);
                            doc.text(lines, margin + 10, yPosition.current);
                            yPosition.current += lines.length * 4 + 5;
                        }
                        break;
                    }

                    case 'table': {
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        const content = block.data?.content || [];
                        if (content.length > 0) {
                            const colWidth = maxWidth / (content[0]?.length || 1);
                            content.forEach((row: any[], rowIndex: number) => {
                                if (yPosition.current > pageHeight - 30) {
                                    doc.addPage();
                                    yPosition.current = margin;
                                }
                                row.forEach((cell: string, colIndex: number) => {
                                    const cellText = cell || '';
                                    const lines = doc.splitTextToSize(cellText, colWidth - 2);
                                    doc.text(lines, margin + colIndex * colWidth, yPosition.current);
                                });
                                yPosition.current += 10;
                            });
                            yPosition.current += 5;
                        }
                        break;
                    }

                    case 'image': {
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        const imageUrl = block.data?.file?.url || block.data?.url || '';
                        const caption = block.data?.caption || '';
                        if (imageUrl) {
                            try {
                                // Pour l'instant, on affiche juste l'URL et la légende
                                doc.text(`[Image: ${imageUrl}]`, margin, yPosition.current);
                                yPosition.current += 5;
                                if (caption) {
                                    doc.setFontSize(8);
                                    doc.setFont('helvetica', 'italic');
                                    doc.text(caption, margin, yPosition.current);
                                    yPosition.current += 5;
                                    doc.setFontSize(10);
                                    doc.setFont('helvetica', 'normal');
                                }
                            } catch (error) {
                                doc.text(`[Image non disponible: ${imageUrl}]`, margin, yPosition.current);
                                yPosition.current += 5;
                            }
                            yPosition.current += 5;
                        }
                        break;
                    }

                    case 'linkTool': {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        const linkUrl = block.data?.link || '';
                        const linkMeta = block.data?.meta || {};
                        const linkTitle = linkMeta.title || linkUrl;
                        if (linkUrl) {
                            doc.setTextColor(0, 0, 255);
                            doc.text(`[Lien: ${linkTitle}](${linkUrl})`, margin, yPosition.current);
                            doc.setTextColor(0, 0, 0);
                            yPosition.current += 5;
                        }
                        break;
                    }

                    default: {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'normal');
                        const text = block.data?.text || '';
                        if (text.trim()) {
                            const lines = doc.splitTextToSize(text, maxWidth);
                            doc.text(lines, margin, yPosition.current);
                            yPosition.current += lines.length * 5 + 5;
                        } else {
                            yPosition.current += 10;
                        }
                        break;
                    }
                }
            });
        } else {
            // Fallback si pas de contenu valide
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Contenu vide', margin, yPosition.current);
        }

        // Sauvegarder le PDF
        doc.save(`${title}.pdf`);

    } catch (error) {
        // Error generating PDF
        // Fallback: créer un PDF simple avec le titre
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(title, 20, 20);
        doc.text('Erreur lors de la génération du contenu', 20, 40);
        doc.save(`${title}.pdf`);
    }
};