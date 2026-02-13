import { CompanyDetails, InvoiceData } from '../../types';

/**
 * Prepares a wrapper containing cloned visible invoice pages for printing or PDF.
 * Strategy: Capture the ALREADY RENDERED React output to ensure WYSIWYG fidelity.
 */
const prepareVisibleInvoiceDOM = (rootElement?: HTMLElement): HTMLElement => {
    // 1. Find the main anchor element (Page 1)
    const originalInvoice = rootElement || document.getElementById('invoice');
    if (!originalInvoice) throw new Error('Invoice visible template not found in DOM');

    const wrapper = document.createElement('div');
    wrapper.className = 'invoice-print-wrapper';
    wrapper.style.width = '210mm';
    wrapper.style.margin = '0 auto';

    // 2. Identify all invoice pages
    // Since React renders sibling divs for pages, we look at the parent or siblings
    const parentCtx = originalInvoice.parentElement;
    let pages: Element[] = [];

    if (parentCtx) {
        // robustly select all invoice page blocks
        const allCandidates = parentCtx.querySelectorAll('div[id^="invoice"]');
        if (allCandidates.length > 0) {
            pages = Array.from(allCandidates);
        } else {
            pages = [originalInvoice];
        }
    } else {
        pages = [originalInvoice];
    }

    // 3. Clone and Sanitize
    pages.forEach((page, index) => {
        const pageClone = page.cloneNode(true) as HTMLElement;

        // Ensure Strict CSS Visibility for the clone
        pageClone.style.display = 'block';
        pageClone.style.visibility = 'visible';
        pageClone.style.opacity = '1';
        pageClone.style.transform = 'none';
        pageClone.style.overflow = 'visible';

        // Ensure background is white and colors are preserved for print
        pageClone.style.backgroundColor = '#ffffff';
        (pageClone.style as any).webkitPrintColorAdjust = 'exact';
        pageClone.style.printColorAdjust = 'exact';

        // Add Page Break
        if (index < pages.length - 1) {
            // margin for visual separation in preview, but meaningless for canvas capture of individual pages
            pageClone.style.marginBottom = '20px';
        }

        // Clean up interactive elements (Buttons, Icons)
        // Remove buttons and elements marked to be hidden in print
        const buttons = pageClone.querySelectorAll('button, [role="button"], .print\\:hidden');
        buttons.forEach(el => el.remove());

        // Convert Inputs/Selects/Textareas to Static Text
        pageClone.querySelectorAll('input, select, textarea').forEach(el => {
            let val = '';
            // Try to find the live element by ID for hydration
            if (el.id) {
                const liveEl = document.getElementById(el.id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
                if (liveEl) val = liveEl.value;
            } else {
                val = (el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
            }

            const span = document.createElement('span');
            span.textContent = val;
            span.style.whiteSpace = 'pre-wrap'; // Preserve formatting for textareas
            if (val) span.style.color = '#000000'; // Ensure visibility

            // basic styling copy
            span.style.fontFamily = 'inherit';
            span.style.fontWeight = 'bold';

            el.parentElement?.replaceChild(span, el);
        });

        // Re-assign image sources to cloned images to ensure they load in the fragment
        pageClone.querySelectorAll('img').forEach(img => {
            const originalSrc = img.getAttribute('src');
            if (originalSrc) img.src = originalSrc;
        });

        wrapper.appendChild(pageClone);
    });

    return wrapper;
};

export const handlePrintInvoice = (_company: CompanyDetails, _data: InvoiceData) => {
    window.print();
};

export const generateInvoicePDF = async (_company: CompanyDetails, data: InvoiceData, options?: { targetElement?: HTMLElement, save?: boolean, pdfInstance?: any }) => {
    // Import dependencies directly
    // @ts-ignore
    const html2canvas = (await import('html2canvas')).default;
    // @ts-ignore
    const { jsPDF } = await import('jspdf');

    let pagedDOM: HTMLElement;
    try {
        pagedDOM = prepareVisibleInvoiceDOM(options?.targetElement);
    } catch (e) {
        alert("Could not prepare invoice for PDF: " + e);
        return;
    }

    const container = document.createElement('div');
    container.id = 'invoice-pdf-capture-stage';

    // Position visible but safe
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '9999';
    container.style.backgroundColor = '#f0f0f0'; // Gray back to distinguish pages
    container.style.width = '210mm';
    container.style.padding = '0';
    container.style.margin = '0';

    document.body.appendChild(container);
    container.appendChild(pagedDOM);

    try {
        // Wait for images
        const images = Array.from(container.querySelectorAll('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        }));
        // Safety delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create or use existing PDF instance
        const pdf = options?.pdfInstance || new jsPDF('p', 'mm', 'a4');

        // Select the cloned pages
        // Note: prepareVisibleInvoiceDOM appends page clones directly to wrapper
        const pages = Array.from(pagedDOM.children) as HTMLElement[];

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];

            // Force dimensions for consistent capture
            page.style.width = '210mm';
            page.style.height = '297mm';

            // Capture the page with high resolution but exact dimensions
            const canvas = await html2canvas(page, {
                scale: 3, // Higher resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: page.offsetWidth,
                height: page.offsetHeight,
                windowWidth: page.offsetWidth,
                windowHeight: page.offsetHeight,
                scrollX: 0,
                scrollY: 0
            });

            const imgData = canvas.toDataURL('image/png', 1.0);

            if (i > 0 || (options?.pdfInstance)) {
                pdf.addPage('a4', 'p');
            }

            // Fill the entire PDF page (210mm x 297mm)
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
        }

        if (options?.save !== false) {
            pdf.save(`${data.customerName ? data.customerName.trim() : `Invoice_${data.invoiceNumber}`}.pdf`);
        }

        return pdf;

    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("Failed to generate PDF. Check console.");
    } finally {
        document.body.removeChild(container);
    }
};
