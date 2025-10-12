import { ClientConfig, DynamicClientConfig, SelectedItem, Category, ConfigurationDefinition } from '../types/domain';
import { formatPrice } from './formatters';
import { calculateTieredPrice } from './tieredPricing';
import { VersionService } from './versionService';
import { isOneTimeUnit } from './unitClassification';

// Helper function to generate detailed pricing section like FeeSummary
function generateDetailedPricingSection(data: PDFData): string {
  const { selectedItems, categories, globalDiscount, globalDiscountType, globalDiscountApplication, summary } = data;
  
  if (!selectedItems || selectedItems.length === 0) {
    return '<p>No pricing items selected.</p>';
  }

  // Calculate row totals (similar to FeeSummary logic)
  const calculateRowTotal = (item: SelectedItem) => {
    if (item.isFree) return 0;
    
    let subtotal = 0;
    if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
      const tieredResult = calculateTieredPrice(item.item, item.quantity);
      subtotal = tieredResult.totalPrice;
    } else {
      subtotal = item.quantity * item.unitPrice;
    }
    
    const discountApplication = item.discountApplication || 'total';
    
    if (discountApplication === 'unit') {
      let effectiveUnitPrice = item.unitPrice;
      
      if (item.discountType === 'percentage') {
        effectiveUnitPrice = item.unitPrice * (1 - item.discount / 100);
      } else {
        effectiveUnitPrice = item.unitPrice - item.discount;
      }
      
      effectiveUnitPrice = Math.max(0, effectiveUnitPrice);
      return effectiveUnitPrice * item.quantity;
    } else {
      let discountAmount = 0;
      if (item.discountType === 'percentage') {
        discountAmount = subtotal * (item.discount / 100);
      } else {
        discountAmount = item.discount * item.quantity;
      }
      
      return Math.max(0, subtotal - discountAmount);
    }
  };

  // Separate one-time and monthly items
  const oneTimeItems = selectedItems.filter(item => 
    item.item.categoryId === 'setup' || isOneTimeUnit(item.item.unit)
  );
  const monthlyItems = selectedItems.filter(item => 
    item.item.categoryId !== 'setup' && !isOneTimeUnit(item.item.unit)
  );

  // Calculate totals
  const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  
  let oneTimeFinal, monthlyFinal;
  
  if (globalDiscountApplication === 'none') {
    oneTimeFinal = oneTimeSubtotal;
    monthlyFinal = monthlySubtotal;
  } else if (globalDiscountApplication === 'both') {
    if (globalDiscountType === 'percentage') {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
      monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
    } else {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
      monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
    }
  } else if (globalDiscountApplication === 'monthly') {
    oneTimeFinal = oneTimeSubtotal;
    if (globalDiscountType === 'percentage') {
      monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
    } else {
      monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
    }
  } else if (globalDiscountApplication === 'onetime') {
    monthlyFinal = monthlySubtotal;
    if (globalDiscountType === 'percentage') {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
    } else {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
    }
  } else {
    oneTimeFinal = oneTimeSubtotal;
    monthlyFinal = monthlySubtotal;
  }
  
  const yearlyFinal = monthlyFinal * 12;

  // Calculate savings
  const totalOriginalPrice = selectedItems.reduce((sum, item) => {
    if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
      const tieredResult = calculateTieredPrice(item.item, item.quantity);
      return sum + tieredResult.totalPrice;
    } else {
      return sum + (item.quantity * item.unitPrice);
    }
  }, 0);
  
  const totalFinalPrice = oneTimeFinal + monthlyFinal;
  const totalSavings = totalOriginalPrice - totalFinalPrice;
  const savingsRate = totalOriginalPrice > 0 ? (totalSavings / totalOriginalPrice) * 100 : 0;

  // Group items by category
  const groupedItems = selectedItems.reduce((acc, item) => {
    if (!acc[item.item.categoryId]) {
      acc[item.item.categoryId] = [];
    }
    acc[item.item.categoryId].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  const sortedCategories = categories
    .filter(cat => groupedItems[cat.id])
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const getCategoryTotal = (categoryId: string) => {
    const items = groupedItems[categoryId] || [];
    return items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  };

  // Build HTML with detailed service table
  let html = '';

  // Detailed Services Table
  html += '<div class="services-table-container">';
  html += '<h3 class="section-subtitle">Service Details</h3>';
  html += '<table class="services-table">';
  html += '<thead>';
  html += '<tr>';
  html += '<th>Service</th>';
  html += '<th>Description</th>';
  html += '<th>Quantity</th>';
  html += '<th>Unit Price</th>';
  html += '<th>Discount</th>';
  html += '<th>Total</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  // Add all services to the table
  selectedItems.forEach(item => {
    const rowTotal = calculateRowTotal(item);
    const originalPrice = item.quantity * item.unitPrice;
    const discountAmount = originalPrice - rowTotal;
    const hasDiscount = discountAmount > 0;
    
    html += '<tr>';
    html += `<td class="service-name">${item.item.name}</td>`;
    html += `<td class="service-description">${item.item.description || 'No description available'}</td>`;
    html += `<td class="service-quantity">${item.quantity}</td>`;
    html += `<td class="service-unit-price">${formatPrice(item.unitPrice)}</td>`;
    
    if (hasDiscount) {
      html += `<td class="service-discount">`;
      if (item.discountType === 'percentage') {
        html += `${item.discount}%`;
      } else {
        html += formatPrice(item.discount);
      }
      html += '</td>';
    } else {
      html += '<td class="service-discount">-</td>';
    }
    
    if (item.isFree) {
      html += '<td class="service-total free">FREE</td>';
    } else {
      html += `<td class="service-total">${formatPrice(rowTotal)}</td>`;
    }
    
    html += '</tr>';
  });

  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  // Category breakdown
  if (sortedCategories.length > 0) {
    html += '<div class="category-breakdown">';
    html += '<h3 class="section-subtitle">Cost by Category</h3>';
    
    sortedCategories.forEach(category => {
      const items = groupedItems[category.id];
      if (!items || items.length === 0) return;
      
      const categoryTotal = getCategoryTotal(category.id);
      const freeItemsCount = items.filter(item => item.isFree).length;
      
      html += '<div class="category-item">';
      html += `<div class="category-name">${category.name} (${items.length}${freeItemsCount > 0 ? ` · ${freeItemsCount} free` : ''})</div>`;
      html += `<div class="category-total">${formatPrice(categoryTotal)}</div>`;
      html += '</div>';
    });
    
    html += '</div>';
  }

  // Discount details
  if (globalDiscount > 0 && globalDiscountApplication !== 'none') {
    const oneTimeGlobalDiscount = oneTimeSubtotal - oneTimeFinal;
    const monthlyGlobalDiscount = monthlySubtotal - monthlyFinal;
    const totalGlobalDiscount = oneTimeGlobalDiscount + monthlyGlobalDiscount;

    html += '<div class="discount-details">';
    html += '<h3 class="section-subtitle">Global Discounts</h3>';
    
    if (oneTimeGlobalDiscount > 0) {
      html += '<div class="discount-item">';
      html += `<div class="discount-label">One-time Global (${globalDiscountType === 'percentage' ? `${globalDiscount}%` : formatPrice(globalDiscount)})</div>`;
      html += `<div class="discount-amount">-${formatPrice(oneTimeGlobalDiscount)}</div>`;
      html += '</div>';
    }
    
    if (monthlyGlobalDiscount > 0) {
      html += '<div class="discount-item">';
      html += `<div class="discount-label">Monthly Global (${globalDiscountType === 'percentage' ? `${globalDiscount}%` : formatPrice(globalDiscount)})</div>`;
      html += `<div class="discount-amount">-${formatPrice(monthlyGlobalDiscount)}</div>`;
      html += '</div>';
    }
    
    html += '</div>';
  }

  // Savings summary
  if (totalSavings > 0) {
    html += '<div class="savings-summary">';
    html += '<h3 class="section-subtitle">💰 Total Savings</h3>';
    html += '<div class="savings-item">';
    html += `<div class="savings-label">You Save (${savingsRate.toFixed(1)}% off)</div>`;
    html += `<div class="savings-amount">${formatPrice(totalSavings)}</div>`;
    html += '</div>';
    html += '</div>';
  }

  // Final totals
  html += '<div class="totals-section">';
  html += '<h3 class="section-subtitle">Cost Summary</h3>';
  html += '<table class="totals-table">';
  html += '<tbody>';
  
  if (oneTimeFinal > 0 || oneTimeItems.length > 0) {
    html += '<tr>';
    html += '<td class="total-label">One-time Total</td>';
    html += `<td class="total-value">${formatPrice(oneTimeFinal)}</td>`;
    html += '</tr>';
  }
  
  if (monthlyFinal > 0 || monthlyItems.length > 0) {
    html += '<tr>';
    html += '<td class="total-label">Monthly Total</td>';
    html += `<td class="total-value">${formatPrice(monthlyFinal)}</td>`;
    html += '</tr>';
    
    html += '<tr>';
    html += '<td class="total-label">Yearly Total</td>';
    html += `<td class="total-value">${formatPrice(yearlyFinal)}</td>`;
    html += '</tr>';
  }
  
  html += '<tr class="grand-total">';
  html += '<td class="total-label">Total Project Cost</td>';
  html += `<td class="total-value">${formatPrice(oneTimeFinal + yearlyFinal)}</td>`;
  html += '</tr>';
  
  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  return html;
}

// Helper function to generate HTML from custom template content
function generateCustomHTMLReport(customContent: any, data: PDFData, systemVersion: string): string {
  console.log('pdfHelpers: Generating custom HTML report from template content');
  
  // Extract template metadata
  const templateName = customContent.template || 'Custom Template';
  const sections = customContent.sections || [];
  const metadata = customContent.metadata || {};
  
  // areeba logo as text (more reliable for PDF generation)
  const areebaLogoText = `
    <div style="text-align: center; margin: 0 auto 20px auto; font-size: 2.5em; font-weight: 700; color: #FF2929; letter-spacing: 2px;">
      areeba
    </div>
  `;

  // Generate timestamp
  const now = new Date();
  const formattedDateTime = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  // Generate detailed pricing section
  const pricingSection = generateDetailedPricingSection(data);
  
  // Build HTML content from template sections
  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName} - ${data.config.clientName}</title>
    <style>
        @page { 
            size: A4; 
            margin: 0;
        }
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            margin: 0; padding: 0; line-height: 1.6; color: hsl(0 0% 3.9%); 
            background: hsl(0 0% 96.1%); min-height: 100vh; display: flex; flex-direction: column; align-items: center;
        }
        .page { 
            width: 210mm; min-height: 297mm; padding: 20mm; background: hsl(0 0% 100%); 
            page-break-after: always; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 297mm; }
        .logo { width: 200px; height: auto; margin-bottom: 40px; }
        .title { font-size: 2.5em; font-weight: 700; color: hsl(0 0% 3.9%); margin-bottom: 20px; }
        .subtitle { font-size: 1.2em; color: hsl(0 0% 45.1%); margin-bottom: 40px; }
        .cover-details { margin-top: 40px; }
        .cover-details p { font-size: 1em; color: hsl(0 0% 45.1%); margin-bottom: 12px; }
        .prepared-by { font-weight: 600; color: hsl(0 0% 3.9%); }
        .simulator-name { font-weight: 500; color: hsl(0 0% 3.9%); }
        .date { font-size: 1em; color: hsl(0 0% 45.1%); }
        .version { font-size: 0.9em; color: hsl(0 0% 45.1%); }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.5em; font-weight: 600; color: hsl(0 0% 3.9%); margin-bottom: 15px; border-bottom: 2px solid hsl(0 0% 89.8%); padding-bottom: 10px; }
        .section-subtitle { font-size: 1.1em; font-weight: 600; color: hsl(0 0% 3.9%); margin: 0 0 12px 0; }
        .content { font-size: 1em; line-height: 1.6; color: hsl(0 0% 3.9%); }
        .divider { height: 1px; background: hsl(0 0% 89.8%); margin: 20px 0; }
        
        /* Table of Contents Styling */
        .toc-item { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 8px 0; border-bottom: 1px solid hsl(0 0% 89.8%); 
        }
        .toc-item a { 
            color: hsl(0 0% 3.9%); text-decoration: none; font-weight: 500;
        }
        .toc-item a:hover { text-decoration: underline; }
        .toc-page-number { 
            color: hsl(0 0% 45.1%); font-size: 0.9em; 
        }
        
        /* Page Footer */
        .page::after {
            content: "Page " counter(page) " of " counter(pages);
            position: absolute;
            bottom: 10mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: hsl(0 0% 45.1%);
            font-weight: 500;
        }
        
        /* Disclaimer Footer */
        .disclaimer {
            position: absolute;
            bottom: 5mm;
            left: 20mm;
            right: 20mm;
            font-size: 8px;
            color: hsl(0 0% 45.1%);
            text-align: center;
            border-top: 1px solid hsl(0 0% 89.8%);
            padding-top: 5px;
        }
        
        /* Services Table - shadcn design */
        .services-table-container {
            margin: 20px 0;
        }
        
        .services-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: hsl(0 0% 100%);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid hsl(0 0% 89.8%);
        }
        
        .services-table th {
            background: hsl(0 0% 96.1%);
            color: hsl(0 0% 45.1%);
            font-weight: 600;
            padding: 12px 16px;
            text-align: left;
            font-size: 0.85em;
            border-bottom: 1px solid hsl(0 0% 89.8%);
        }
        
        .services-table td {
            padding: 12px 16px;
            border-bottom: 1px solid hsl(0 0% 96.1%);
            font-size: 0.85em;
        }
        
        .services-table tr:last-child td {
            border-bottom: none;
        }
        
        .service-name {
            font-weight: 600;
            color: hsl(0 0% 3.9%);
        }
        
        .service-description {
            color: hsl(0 0% 45.1%);
            font-size: 0.8em;
        }
        
        .service-quantity {
            text-align: center;
            font-weight: 500;
        }
        
        .service-unit-price {
            text-align: right;
            font-weight: 500;
        }
        
        .service-discount {
            text-align: center;
            color: hsl(0 84.2% 60.2%);
            font-weight: 500;
        }
        
        .service-total {
            text-align: right;
            font-weight: 600;
        }
        
        .service-total.free {
            color: hsl(142 76% 36%);
        }
        
        /* Totals Table */
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: hsl(0 0% 100%);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid hsl(0 0% 89.8%);
        }
        
        .totals-table td {
            padding: 12px 16px;
            border-bottom: 1px solid hsl(0 0% 96.1%);
        }
        
        .totals-table tr:last-child td {
            border-bottom: none;
        }
        
        .total-label {
            font-weight: 500;
            color: hsl(0 0% 3.9%);
        }
        
        .total-value {
            text-align: right;
            font-weight: 600;
            color: hsl(0 0% 3.9%);
        }
        
        .grand-total {
            background: hsl(0 0% 96.1%);
            border-top: 2px solid hsl(0 0% 89.8%);
        }
        
        .grand-total .total-label {
            font-weight: 700;
            font-size: 1.1em;
        }
        
        .grand-total .total-value {
            font-weight: 700;
            font-size: 1.1em;
            color: hsl(142 76% 36%);
        }
        
        /* Category Breakdown */
        .category-breakdown {
            background: hsl(0 0% 96.1%);
            border: 1px solid hsl(0 0% 89.8%);
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid hsl(0 0% 89.8%);
        }
        
        .category-item:last-child {
            border-bottom: none;
        }
        
        .category-name {
            font-weight: 500;
            color: hsl(0 0% 3.9%);
        }
        
        .category-total {
            font-weight: 600;
            color: hsl(142 76% 36%);
        }
        
        /* Discount Details */
        .discount-details {
            background: hsl(48 96% 89%);
            border: 1px solid hsl(45 93% 47%);
            border-radius: 8px;
            padding: 12px;
            margin: 12px 0;
        }
        
        .discount-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
        }
        
        .discount-label {
            color: hsl(32 95% 44%);
            font-size: 0.9em;
        }
        
        .discount-amount {
            color: hsl(0 84.2% 60.2%);
            font-weight: 600;
            font-size: 0.9em;
        }
        
        /* Savings Summary */
        .savings-summary {
            background: hsl(142 76% 97%);
            border: 1px solid hsl(142 76% 36%);
            border-radius: 8px;
            padding: 12px;
            margin: 12px 0;
        }
        
        .savings-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 0;
        }
        
        .savings-label {
            color: hsl(142 76% 36%);
            font-weight: 500;
        }
        
        .savings-amount {
            color: hsl(142 76% 36%);
            font-weight: 700;
        }
        
        /* Print Styles */
        @media print {
            body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .page-break { page-break-after: always; }
            .no-break { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page cover-page" id="cover">
        ${areebaLogoText}
        <h1 class="title">Pricing Proposal</h1>
        <p class="subtitle">${data.config.clientName} - ${data.config.projectName}</p>
        <div class="cover-details">
            <p class="prepared-by">Prepared by: ${data.config.preparedBy || 'areeba Team'}</p>
            <p class="simulator-name">Simulator: ${data.simulator?.name || 'Payment Processing'}</p>
            <p class="date">Date: ${formattedDateTime}</p>
            <p class="version">Platform Version: ${systemVersion}</p>
        </div>
    </div>

    <!-- Table of Contents -->
    <div class="page" id="toc">
        <div class="toc-header">
            <h1 class="toc-title">Table of Contents</h1>
            <p class="toc-subtitle">${templateName} - ${data.config.clientName}</p>
        </div>
        <div class="toc-content">
            <div class="toc-column">
                <div class="toc-item">
                    <a href="#pricing-details">Pricing Details</a>
                    <span class="toc-page-number">3</span>
                </div>
                <div class="toc-item">
                    <a href="#project-summary">Project Summary</a>
                    <span class="toc-page-number">4</span>
                </div>
            </div>
            <div class="toc-column">
                <div class="toc-item">
                    <a href="#contact-info">Contact Information</a>
                    <span class="toc-page-number">5</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Pricing Details Page -->
    <div class="page" id="pricing-details">
        <div class="section-header">
            <h1 class="section-title">Pricing Details</h1>
        </div>
        <div class="section-content">
            <p>This section contains detailed pricing breakdown based on your configuration and selected services.</p>
            
            ${pricingSection}
        </div>
    </div>

    <!-- Project Summary Page -->
    <div class="page" id="project-summary">
        <div class="section-header">
            <h1 class="section-title">Project Summary</h1>
        </div>
        <div class="section-content">
            <table class="pricing-table">
                <tr>
                    <td><strong>One-time Total</strong></td>
                    <td><strong>${formatPrice(data.summary.oneTimeTotal)}</strong></td>
                </tr>
                <tr>
                    <td><strong>Monthly Total</strong></td>
                    <td><strong>${formatPrice(data.summary.monthlyTotal)}</strong></td>
                </tr>
                <tr>
                    <td><strong>Yearly Total</strong></td>
                    <td><strong>${formatPrice(data.summary.yearlyTotal)}</strong></td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Project Cost</strong></td>
                    <td><strong>${formatPrice(data.summary.totalProjectCost)}</strong></td>
                </tr>
            </table>
        </div>
    </div>

    <!-- Contact Information Page -->
    <div class="page" id="contact-info">
        <div class="section-header">
            <h1 class="section-title">Get Started</h1>
        </div>
        <div class="section-content">
            <p>Ready to implement this solution? Contact our team to get started with your payment processing needs.</p>
            
            <div style="margin-top: 24px;">
                <p><strong>Email:</strong> info@areeba.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Website:</strong> www.areeba.com</p>
            </div>
        </div>
    </div>

    <!-- Disclaimer Footer -->
    <div class="disclaimer">
        © 2025 areeba. All rights reserved. This document is confidential and proprietary.
    </div>
</body>
</html>`;

  return htmlContent;
}

// Helper function to generate pricing table HTML
function generatePricingTableHTML(selectedItems: SelectedItem[], categories: Category[]): string {
  let html = '<table class="pricing-table"><thead><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead><tbody>';
  
  selectedItems.forEach(item => {
    html += `<tr>
      <td>${item.item.name}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.unitPrice)}</td>
      <td>${formatPrice(item.quantity * item.unitPrice)}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  return html;
}

// Helper function to generate custom table HTML
function generateCustomTableHTML(headers: string[], rows: any[]): string {
  let html = '<table class="pricing-table"><thead><tr>';
  headers.forEach(header => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      html += `<td>${row[header] || ''}</td>`;
      });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

// Helper function to generate bullet list HTML
function generateBulletListHTML(items: any[]): string {
  let html = '<ul class="bullet-list">';
  items.forEach(item => {
    const text = typeof item === 'string' ? item : (item.text || item);
    html += `<li>${text}</li>`;
  });
  html += '</ul>';
  return html;
}

// Helper function to get callout icon
function getCalloutIcon(type: string): string {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌'
  };

  return icons[type as keyof typeof icons] || 'ℹ️';
}

// Helper function to ensure a legacy template exists for the simulator
async function ensureLegacyTemplate(simulatorType: string): Promise<string> {
  try {
    // Import PdfBuilderService dynamically to avoid circular dependencies
    const { PdfBuilderService } = await import('../features/pdfBuilder/api/pdfBuilderService');
    
    // Try to find existing legacy template
    const templates = await PdfBuilderService.getTemplates({ 
      simulator_type: simulatorType,
      search: 'Legacy Template'
    });
    
    const legacyTemplate = templates.templates.find(t => 
      t.template_name === 'Legacy Template' && t.simulator_type === simulatorType
    );
    
    if (legacyTemplate) {
      console.log('pdfHelpers: Found existing legacy template:', legacyTemplate.id);
      return legacyTemplate.id;
    }
    
    // Create a new legacy template
    console.log('pdfHelpers: Creating new legacy template for simulator:', simulatorType);
    const newTemplate = await PdfBuilderService.createTemplate({
      template_name: 'Legacy Template',
      simulator_type: simulatorType,
      section_ids: []
    });
    
    console.log('pdfHelpers: Created legacy template:', newTemplate.id);
    return newTemplate.id;
  } catch (error) {
    console.error('pdfHelpers: Failed to ensure legacy template:', error);
    // Fallback to a hardcoded UUID that should exist
    return '00000000-0000-0000-0000-000000000000';
  }
}

interface PDFData {
  config: DynamicClientConfig;
  legacyConfig?: ClientConfig;
  configDefinitions?: ConfigurationDefinition[];
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  globalDiscountApplication: 'none' | 'both' | 'monthly' | 'onetime';
  simulator?: {
    id: string;
    name: string;
    description?: string;
    urlSlug?: string;
  };
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
    itemCount?: number;
  };
  customContent?: any; // Custom template content from PDF builder
}

export async function downloadPDF(data: PDFData) {
  console.log('pdfHelpers: Starting PDF generation...', data);
  
  // Get current system version
  let systemVersion = 'v2.2.0'; // fallback
  try {
    systemVersion = await VersionService.getCurrentVersion();
  } catch (error) {
    console.warn('Could not fetch system version, using fallback:', error);
  }
  
  // Validate input data and provide fallbacks
  const safeData: PDFData = {
    config: data.config || { clientName: '', projectName: '', preparedBy: '', configValues: {} },
    legacyConfig: data.legacyConfig,
    configDefinitions: data.configDefinitions || [],
    selectedItems: data.selectedItems || [],
    categories: data.categories || [],
    globalDiscount: data.globalDiscount || 0,
    globalDiscountType: data.globalDiscountType || 'percentage',
    globalDiscountApplication: data.globalDiscountApplication || 'none',
    simulator: data.simulator,
    summary: data.summary || {
      oneTimeTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      totalProjectCost: 0
    },
    customContent: data.customContent
  };
  
  // Create HTML content for the PDF
  let htmlContent: string;
  
  if (safeData.customContent) {
    // Use custom template content from PDF builder
    console.log('pdfHelpers: Using custom template content', safeData.customContent);
    htmlContent = generateCustomHTMLReport(safeData.customContent, safeData, systemVersion);
  } else {
    // Use legacy HTML generation
    console.log('pdfHelpers: Using legacy HTML generation - no custom content provided');
    htmlContent = generateHTMLReport(safeData, systemVersion);
  }
  
  // Save to database if we have the required data
  if (safeData.config?.clientName && safeData.config?.projectName && safeData.simulator?.id) {
    console.log('pdfHelpers: Attempting to save PDF to database...');
    try {
      // Import PdfBuilderService dynamically to avoid circular dependencies
      const { PdfBuilderService } = await import('../features/pdfBuilder/api/pdfBuilderService');
      
      let templateId: string;
      
      if (safeData.customContent) {
        // Use the active template ID from the custom content
        console.log('pdfHelpers: Using active template for custom content');
        const activeTemplate = await PdfBuilderService.getActiveTemplate(safeData.simulator.id);
        templateId = activeTemplate?.id || await ensureLegacyTemplate(safeData.simulator.id);
      } else {
        // Use legacy template for backward compatibility
        console.log('pdfHelpers: Using legacy template');
        templateId = await ensureLegacyTemplate(safeData.simulator.id);
      }
      
      await PdfBuilderService.createGeneratedPdf({
        template_id: templateId,
        client_name: safeData.config.clientName,
        project_name: safeData.config.projectName,
        simulator_type: safeData.simulator.id,
        pricing_data: {
          selectedItems: safeData.selectedItems,
          categories: safeData.categories,
          globalDiscount: safeData.globalDiscount,
          globalDiscountType: safeData.globalDiscountType,
          globalDiscountApplication: safeData.globalDiscountApplication,
          summary: safeData.summary,
          config: safeData.config
        }
      });
      console.log('pdfHelpers: Successfully saved PDF to database');
    } catch (error) {
      console.error('pdfHelpers: Failed to save PDF to database:', error);
      // Don't throw - we still want the PDF to be generated
    }
  } else {
    console.log('pdfHelpers: Skipping database save - missing required data:', {
      clientName: safeData.config?.clientName,
      projectName: safeData.config?.projectName,
      simulatorId: safeData.simulator?.id
    });
  }
  
  // Generate HTML preview instead of PDF
  try {
    console.log('pdfHelpers: Generating HTML preview with custom template structure');
    
    // Check if we have custom template content
    if (safeData.customContent && safeData.customContent.sections) {
      console.log('pdfHelpers: Using custom template with sections:', safeData.customContent.sections.length);
      console.log('pdfHelpers: Custom content structure:', JSON.stringify(safeData.customContent, null, 2));
      
      // Generate HTML content
      const htmlContent = generateHTMLPreview(safeData, systemVersion);
      
      // Create a dedicated URL for the HTML preview
      const previewId = `preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previewUrl = `${window.location.origin}/preview/${previewId}`;
      
      // Save the HTML preview to Supabase
      try {
        await savePreviewToSupabase(previewId, htmlContent, safeData);
        console.log('pdfHelpers: HTML preview saved to Supabase');
      } catch (error) {
        console.error('pdfHelpers: Failed to save preview to Supabase:', error);
        // Fallback to localStorage
        localStorage.setItem(`preview-${previewId}`, htmlContent);
        console.log('pdfHelpers: Fallback to localStorage');
      }
      
      // Open the dedicated URL in new tab
      const newWindow = window.open(previewUrl, '_blank');
      if (newWindow) {
        console.log('pdfHelpers: HTML preview opened at:', previewUrl);
        
        // Show success message with the URL
        if (typeof window !== 'undefined' && window.alert) {
          setTimeout(() => {
            alert(`Preview generated successfully!\n\nURL: ${previewUrl}\n\nThis URL can be bookmarked and shared.`);
          }, 1000);
        }
      } else {
        throw new Error('Failed to open new window. Please check your popup blocker settings.');
      }
      
    } else {
      // No custom template content found - show error
      console.error('pdfHelpers: No custom template content found');
      throw new Error('No PDF template configured. Please create a template in the PDF Builder.');
    }
    
  } catch (error) {
    console.error('pdfHelpers: Failed to generate HTML preview:', error);
    throw error;
  }
}

// Save HTML preview to Supabase
async function savePreviewToSupabase(previewId: string, htmlContent: string, data: PDFData) {
  const { supabase } = await import('../utils/supabase/client');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate a proper UUID for the database
  const dbId = crypto.randomUUID();
  
  // Save to generated_pdfs table with HTML content
  const { error } = await supabase
    .from('generated_pdfs')
    .insert({
      id: dbId,
      template_id: data.customContent?.template_id || null,
      client_name: data.config?.clientName || 'Unknown Client',
      project_name: data.config?.projectName || 'Unknown Project',
      simulator_type: data.simulator?.id || 'unknown',
      pricing_data: {
        ...data,
        html_content: htmlContent,
        preview_id: previewId,
        generated_at: new Date().toISOString()
      },
      generated_by: user?.id || null
    } as any);

  if (error) {
    throw new Error(`Failed to save preview to Supabase: ${error.message}`);
  }
  
  console.log('pdfHelpers: Preview saved to Supabase with ID:', dbId, 'Preview ID:', previewId);
}

// Load HTML preview from Supabase
export async function loadPreviewFromSupabase(previewId: string): Promise<string | null> {
  const { supabase } = await import('../utils/supabase/client');
  
  // Use contains operator to search in JSON field
  const { data, error } = await supabase
    .from('generated_pdfs')
    .select('*')
    .contains('pricing_data', { preview_id: previewId })
    .single();

  if (error) {
    console.error('pdfHelpers: Failed to load preview from Supabase:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return (data as any)?.pricing_data?.html_content || null;
}

// Generate HTML preview with custom template sections
function generateHTMLPreview(data: PDFData, systemVersion: string = '1.0.0'): string {
  console.log('pdfHelpers: Generating HTML preview with sections:', data.customContent?.sections?.length || 0);
  
  const safeData = {
    config: data.config || {
      clientName: 'Unknown Client',
      projectName: 'Unknown Project',
      preparedBy: 'System',
      configValues: {},
    },
    selectedItems: data.selectedItems || [],
    categories: data.categories || [],
    globalDiscount: data.globalDiscount || 0,
    globalDiscountType: data.globalDiscountType || 'percentage',
    globalDiscountApplication: data.globalDiscountApplication || 'none',
    simulator: data.simulator || { id: 'unknown', name: 'Unknown Simulator' },
    summary: data.summary || {
      oneTimeTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      totalProjectCost: 0,
      itemCount: 0
    },
    customContent: data.customContent
  };

  // Generate dynamic sections based on template content
  const sections = generateDynamicSections(safeData, systemVersion);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Proposal - ${safeData.config.clientName || 'Client'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .document-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            min-height: 100vh;
        }
        
        .page {
            padding: 20mm;
            min-height: 297mm;
            position: relative;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .cover-page {
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 297mm;
        }
        
        .logo {
            font-size: 48px;
            font-weight: bold;
            color: #ff2929;
            margin-bottom: 20px;
        }
        
        .title {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        
        .subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 40px;
        }
        
        .details {
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
        }
        
        .detail-row {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 2px solid #ff2929;
            padding-bottom: 10px;
        }
        
        .toc {
            list-style: none;
        }
        
        .toc li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
        }
        
        .toc li:last-child {
            border-bottom: none;
        }
        
        .pricing-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .pricing-table th,
        .pricing-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .pricing-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .pricing-table tr:hover {
            background-color: #f5f5f5;
        }
        
        .free {
            color: #28a745;
            font-weight: bold;
        }
        
        .discount {
            color: #dc3545;
            font-weight: bold;
        }
        
        .summary-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .summary-total {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            border-top: 2px solid #28a745;
            padding-top: 10px;
        }
        
        .contact-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .contact-item {
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            padding: 10px 20px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
        }
        
        .download-btn {
            background-color: #ff2929;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        
        .download-btn:hover {
            background-color: #e02424;
        }
        
        .page-number {
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .document-container {
                box-shadow: none;
            }
            
            .footer {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="document-container">
        ${sections}
    </div>
    
    <div class="footer">
        <div class="page-number">Page 1 of 1</div>
        <button class="download-btn" onclick="downloadPDF()">Download as PDF</button>
    </div>
    
    <script>
        function downloadPDF() {
            // This will be implemented to convert HTML to PDF
            alert('PDF download functionality will be implemented here');
        }
    </script>
</body>
</html>`;

  return html;
}

// Generate dynamic sections based on template content
function generateDynamicSections(data: PDFData, systemVersion: string): string {
  const sections = [];
  
  // Always start with cover page
  sections.push(generateCoverPage(data, systemVersion));
  
  // Add table of contents
  sections.push(generateTableOfContents(data));
  
  // Process custom template sections
  if (data.customContent && data.customContent.sections) {
    for (const section of data.customContent.sections) {
      console.log('pdfHelpers: Processing section:', section.section_title, 'Type:', section.section_type);
      
      switch (section.section_type) {
        case 'description':
          sections.push(generateCustomSection(section));
          break;
        default:
          sections.push(generateCustomSection(section));
          break;
      }
    }
  }
  
  // Add pricing section
  sections.push(generatePricingSection(data));
  
  // Add project summary
  sections.push(generateProjectSummary(data));
  
  // Add contact section
  sections.push(generateContactSection());
  
  return sections.join('\n');
}

// Generate cover page
function generateCoverPage(data: PDFData, systemVersion: string): string {
  return `
    <div class="page cover-page">
      <div class="logo">areeba</div>
      <div class="title">Pricing Proposal</div>
      <div class="subtitle">${data.config.clientName || 'Client'} - ${data.config.projectName || 'Project'}</div>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Prepared by:</span> ${data.config.preparedBy || 'areeba Team'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Simulator:</span> ${data.simulator?.name || 'Payment Processing'}
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span> ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </div>
        <div class="detail-row">
          <span class="detail-label">Platform Version:</span> ${systemVersion}
        </div>
      </div>
    </div>
  `;
}

// Generate table of contents
function generateTableOfContents(data: PDFData): string {
  return `
    <div class="page">
      <div class="section">
        <div class="section-title">Table of Contents</div>
        <ul class="toc">
          <li><span>Pricing Details</span><span>3</span></li>
          <li><span>Project Summary</span><span>4</span></li>
          <li><span>Contact Information</span><span>5</span></li>
        </ul>
      </div>
    </div>
  `;
}

// Generate custom section
function generateCustomSection(section: any): string {
  return `
    <div class="page">
      <div class="section">
        <div class="section-title">${section.section_title}</div>
        <div class="content">
          ${section.content?.html || section.content?.text || 'No content available'}
        </div>
      </div>
    </div>
  `;
}

// Generate pricing section
function generatePricingSection(data: PDFData): string {
  const selectedItems = data.selectedItems || [];
  
  return `
    <div class="page">
      <div class="section">
        <div class="section-title">Pricing Details</div>
        <p>This section contains detailed pricing breakdown based on your configuration and selected services.</p>
        
        <table class="pricing-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems.map(item => {
              const total = item.isFree ? 0 : (item.quantity * item.unitPrice);
              const hasDiscount = item.discount > 0;
              
              return `
                <tr>
                  <td>${item.item.name}</td>
                  <td>${item.item.description || 'No description'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.isFree ? 'FREE' : formatPrice(item.unitPrice)}</td>
                  <td class="${hasDiscount ? 'discount' : ''}">${hasDiscount ? `${item.discount}%` : '-'}</td>
                  <td class="${item.isFree ? 'free' : ''}">${item.isFree ? 'FREE' : formatPrice(total)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Generate project summary
function generateProjectSummary(data: PDFData): string {
  return `
    <div class="page">
      <div class="section">
        <div class="section-title">Project Summary</div>
        <div class="summary-box">
          <div class="summary-row">
            <span>One-time Total:</span>
            <span>${formatPrice(data.summary.oneTimeTotal)}</span>
          </div>
          <div class="summary-row">
            <span>Monthly Total:</span>
            <span>${formatPrice(data.summary.monthlyTotal)}</span>
          </div>
          <div class="summary-row">
            <span>Yearly Total:</span>
            <span>${formatPrice(data.summary.yearlyTotal)}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total Project Cost:</span>
            <span>${formatPrice(data.summary.totalProjectCost)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Generate contact section
function generateContactSection(): string {
  return `
    <div class="page">
      <div class="section">
        <div class="section-title">Get Started</div>
        <p>Ready to implement this solution? Contact our team to get started with your payment processing needs.</p>
        
        <div class="contact-info">
          <div class="contact-item">
            <strong>Email:</strong> info@areeba.com
          </div>
          <div class="contact-item">
            <strong>Phone:</strong> +1 (555) 123-4567
          </div>
          <div class="contact-item">
            <strong>Website:</strong> www.areeba.com
          </div>
        </div>
      </div>
    </div>
  `;
}

// Legacy HTML generation function
function generateHTMLReport(data: PDFData, systemVersion: string = '1.0.0'): string {
  // This is the legacy HTML generation function
  // It creates a simple HTML report without the enhanced template system
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pricing Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .pricing-table { width: 100%; border-collapse: collapse; }
        .pricing-table th, .pricing-table td { border: 1px solid #ddd; padding: 8px; }
        .pricing-table th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Pricing Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="section">
        <h2>Summary</h2>
        <p>One-time Total: ${formatPrice(data.summary.oneTimeTotal)}</p>
        <p>Monthly Total: ${formatPrice(data.summary.monthlyTotal)}</p>
        <p>Yearly Total: ${formatPrice(data.summary.yearlyTotal)}</p>
        <p>Total Project Cost: ${formatPrice(data.summary.totalProjectCost)}</p>
      </div>
    </body>
    </html>
  `;
}
