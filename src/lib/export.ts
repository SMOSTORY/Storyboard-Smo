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

    // Pre-process any massively huge images in DOM that might break html-to-image SVG limits.
    const images = document.querySelectorAll('.board-page img');
    for (let i = 0; i < images.length; i++) {
        const img = images[i] as HTMLImageElement;
        if (img.src && img.src.length > 1000000) { // If larger than ~1MB base64
            const canvas = document.createElement('canvas');
            canvas.width = img.clientWidth > 0 ? img.clientWidth * 2 : 800;
            canvas.height = img.clientHeight > 0 ? img.clientHeight * 2 : 600;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                img.src = canvas.toDataURL('image/jpeg', 0.8);
            }
        }
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
      
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: lightMode ? '#ffffff' : '#252525',
        filter: (node: any) => {
          if (node?.classList?.contains('hide-in-export')) {
            return false;
          }
          return true;
        }
      };
      
      // Some browsers (like Safari/Chrome) need a first pass to load images/fonts properly 
      await toJpeg(el, options);
      const imgData = await toJpeg(el, options);
      
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
