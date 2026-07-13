import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';
import { format } from 'date-fns';

export const exportPdf = async (
  projectName: string, 
  lightMode: boolean = false,
  onProgress?: (current: number, total: number) => void
) => {
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

    const originalScrollY = window.scrollY;
    
    for (let i = 0; i < elements.length; i++) {
      if (onProgress) {
        onProgress(i + 1, elements.length);
      }
      const el = elements[i];
      
      // Scroll into view to force browser to render images that might be off-screen
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      
      // Wait for the browser to render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const options = {
        quality: 0.95,
        pixelRatio: 1.5,
        backgroundColor: lightMode ? '#ffffff' : '#252525',
        skipFonts: true,
        fetchRequestInit: {
          cache: 'no-cache',
        },
        filter: (node: any) => {
          if (node?.classList?.contains('hide-in-export')) {
            return false;
          }
          if (node?.tagName === 'INPUT' && node?.type === 'file') {
            return false;
          }
          return true;
        }
      };
      
      const imgData = await toJpeg(el, options).catch(async (e) => {
          console.warn("First toJpeg try failed, retrying...", e);
          await new Promise(r => setTimeout(r, 100));
          return await toJpeg(el, options);
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

    window.scrollTo({ top: originalScrollY, behavior: 'instant' });

    const safeProjectName = (projectName || 'Storyboard').trim().replace(/\s+/g, '_');
    pdf.save(`${safeProjectName}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
  } catch (error) {
    const elements = Array.from(document.querySelectorAll('.board-page')) as HTMLElement[];
    elements.forEach(el => {
      el.classList.remove('is-exporting');
      if (lightMode) el.classList.remove('light-export');
    });
    console.error('PDF Export failed:', error);
    
    let msg = String(error);
    if (error && typeof error === 'object' && error.target) {
      if (error.target.tagName) {
        msg = "Element failed to load: " + error.target.tagName;
        if (error.target.src) msg += " src=" + error.target.src;
        if (error.target.href) msg += " href=" + error.target.href;
      }
    }
    alert(`Export failed: ${error instanceof Error ? error.message : msg}`);
  
  }
};

export const exportBookPdf = async (
  projectName: string,
  onProgress?: (current: number, total: number) => void
) => {
  try {
    const elements = Array.from(document.querySelectorAll('.book-page')) as HTMLElement[];
    if (!elements || elements.length === 0) {
      alert('No pages found to export. Switch to Book edit view first.');
      return;
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    elements.forEach(el => el.classList.add('is-exporting'));
    await new Promise(resolve => setTimeout(resolve, 50));

    const originalScrollY = window.scrollY;
    
    for (let i = 0; i < elements.length; i++) {
      if (onProgress) {
        onProgress(i + 1, elements.length);
      }
      const el = elements[i];
      
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const options = {
        quality: 0.95,
        pixelRatio: 1.5,
        backgroundColor: '#fdfdfd',
        skipFonts: true,
        fetchRequestInit: {
          cache: 'no-cache',
        },
        filter: (node: any) => {
          if (node?.classList?.contains('hide-in-export')) {
            return false;
          }
          if (node?.tagName === 'INPUT' && node?.type === 'file') {
            return false;
          }
          return true;
        }
      };
      
      const imgData = await toJpeg(el, options).catch(async (e) => {
          console.warn("First toJpeg try failed, retrying...", e);
          await new Promise(r => setTimeout(r, 100));
          return await toJpeg(el, options);
      });
      
      if (i > 0) {
        pdf.addPage();
      }
      
      const pdfWidth = 297;
      const pdfHeight = 105; // 594 / 210 ratio is roughly 2.8, so height is width / 2.8. Wait. 
      // 594 / 210 = 2.828.
      // A4 is 297 x 210
      // So height should be 297 / 2.828 = 105mm!
      
      // Let's position it vertically centered.
      const yOffset = (210 - 105) / 2;
      
      pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfWidth, 105);
    }

    elements.forEach(el => {
      el.classList.remove('is-exporting');
    });

    window.scrollTo({ top: originalScrollY, behavior: 'instant' });

    const safeProjectName = (projectName || 'Book').trim().replace(/\s+/g, '_');
    pdf.save(`${safeProjectName}_Book_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
  } catch (error) {
    const elements = Array.from(document.querySelectorAll('.book-page')) as HTMLElement[];
    elements.forEach(el => el.classList.remove('is-exporting'));
    console.error('PDF Export failed:', error);
    alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
