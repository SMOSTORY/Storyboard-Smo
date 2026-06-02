import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { format } from 'date-fns';

export const exportPdf = async (projectName: string, lightMode: boolean = false) => {
  try {
    const elements = Array.from(document.querySelectorAll('.board-page')) as HTMLElement[];
    if (!elements || elements.length === 0) {
      alert('No pages found to export.');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    elements.forEach(el => el.classList.add('is-exporting'));
    if (lightMode) {
      elements.forEach(el => el.classList.add('light-export'));
    }
    await new Promise(resolve => setTimeout(resolve, 50));

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      
      const imgData = await toJpeg(el, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: lightMode ? '#ffffff' : '#252525',
        filter: (node) => {
          if (node?.classList?.contains('hide-in-export')) {
            return false;
          }
          return true;
        }
      });
      
      if (i > 0) {
        pdf.addPage();
      }
      
      const pdfWidth = 297;
      const pdfHeight = 210;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    elements.forEach(el => {
      el.classList.remove('is-exporting');
      if (lightMode) el.classList.remove('light-export');
    });

    const safeProjectName = (projectName || 'Storyboard').trim().replace(/\s+/g, '_');
    pdf.save(`${safeProjectName}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
  } catch (error) {
    const elements = Array.from(document.querySelectorAll('.board-page')) as HTMLElement[];
    elements.forEach(el => {
      el.classList.remove('is-exporting');
      if (lightMode) el.classList.remove('light-export');
    });
    console.error('PDF Export failed:', error);
    alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
