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
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const getCategoryTotal = (categoryId: string) => {
    const items = groupedItems[categoryId] || [];
    return items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  };

  // Build HTML
  let html = '';

  // Category breakdown
  if (sortedCategories.length > 0) {
    html += '<div class="category-breakdown">';
    html += '<h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 1.1em;">Cost by Category</h3>';
    
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
    html += '<h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 1.1em;">Discount Details</h3>';
    
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
    html += '<h3 style="margin: 0 0 12px 0; color: #065f46; font-size: 1.1em;">💰 Total Savings</h3>';
    html += '<div class="savings-item">';
    html += `<div class="savings-label">You Save (${savingsRate.toFixed(1)}% off)</div>`;
    html += `<div class="savings-amount">${formatPrice(totalSavings)}</div>`;
    html += '</div>';
    html += '</div>';
  }

  // Final totals
  html += '<table class="pricing-table">';
  html += '<thead><tr><th>Cost Type</th><th>Amount</th></tr></thead>';
  html += '<tbody>';
  
  if (oneTimeFinal > 0 || oneTimeItems.length > 0) {
    html += '<tr>';
    html += '<td><strong>One-time Total</strong></td>';
    html += `<td><strong>${formatPrice(oneTimeFinal)}</strong></td>`;
    html += '</tr>';
  }
  
  if (monthlyFinal > 0 || monthlyItems.length > 0) {
    html += '<tr>';
    html += '<td><strong>Monthly Total</strong></td>';
    html += `<td><strong>${formatPrice(monthlyFinal)}</strong></td>`;
    html += '</tr>';
    
    html += '<tr>';
    html += '<td><strong>Yearly Total</strong></td>';
    html += `<td><strong>${formatPrice(yearlyFinal)}</strong></td>`;
    html += '</tr>';
  }
  
  html += '<tr class="total-row">';
  html += '<td><strong>Total Project Cost</strong></td>';
  html += `<td><strong>${formatPrice(oneTimeFinal + yearlyFinal)}</strong></td>`;
  html += '</tr>';
  
  html += '</tbody>';
  html += '</table>';

  return html;
}

// Helper function to generate HTML from custom template content
function generateCustomHTMLReport(customContent: any, data: PDFData, systemVersion: string): string {
  // // console.log('pdfHelpers: Generating custom HTML report from template content');
  
  // Extract template metadata
  const templateName = customContent.template || 'Custom Template';
  const sections = customContent.sections || [];
  const metadata = customContent.metadata || {};
  
  // areeba logo SVG
  const areebaLogoSVG = `
    <svg width="200" height="50" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 2821 720" style="margin: 0 auto 20px auto; display: block;">
      <path clip-rule="evenodd" d="M312.359 512.203C312.359 583.777 267.236 626.08 196.635 626.08C144.899 626.08 116.697 605.366 116.697 562.966C116.697 525.331 144.024 501.797 215.501 495.185L312.359 487.697V512.203ZM0 567.731C0 655.254 60.1963 712.727 159 712.727C231.449 712.727 294.466 679.761 314.207 631.72L322.667 700.474H423.319V418.067C423.319 289.117 346.201 221.335 221.044 221.335C95.8861 221.335 12.2532 287.172 12.2532 387.921H110.084C110.084 339.005 147.719 310.706 215.403 310.706C273.752 310.706 311.387 336.088 311.387 399.201V409.51L172.128 419.818C62.044 428.278 0 481.959 0 567.634L0 567.731ZM796.36 233.491V339.88H754.058C671.3 339.88 619.564 384.128 619.564 474.471V700.474H504.812V236.312H612.951L619.564 304.093C639.306 257.998 683.553 226.879 745.597 226.879C761.546 226.879 777.592 228.726 796.36 233.491ZM931.146 421.86C942.426 352.231 983.854 315.471 1051.54 315.471C1119.22 315.471 1164.44 357.871 1164.44 421.86H931.146ZM819.214 467.955C819.214 611.979 916.072 712.727 1054.36 712.727C1175.72 712.727 1260.33 651.559 1280.17 549.838H1173.88C1160.75 594.085 1119.32 618.592 1056.3 618.592C980.061 618.592 936.786 577.164 928.325 495.282L1278.22 494.309V459.495C1278.22 314.499 1189.82 221.335 1050.57 221.335C911.307 221.335 819.116 322.084 819.116 468.053L819.214 467.955ZM1553.53 315.471C1485.85 315.471 1444.42 352.231 1433.14 421.86H1666.43C1666.43 357.871 1622.19 315.471 1553.53 315.471ZM1556.35 712.727C1418.06 712.727 1321.21 611.979 1321.21 467.955C1321.21 323.932 1416.22 221.238 1552.65 221.238C1689.09 221.238 1780.31 314.401 1780.31 459.398V494.212L1430.41 495.185C1438.88 577.067 1482.15 618.495 1558.39 618.495C1621.41 618.495 1662.84 593.988 1675.96 549.741H1782.26C1762.52 651.461 1677.81 712.63 1556.45 712.63L1556.35 712.727ZM2702.9 512.203C2702.9 583.777 2657.78 626.08 2587.17 626.08C2535.44 626.80 2507.24 605.366 2507.24 562.966C2507.24 525.331 2534.56 501.797 2606.04 495.185L2702.9 487.697V512.203ZM2389.66 567.731C2389.66 655.254 2449.86 712.727 2548.66 712.727C2621.11 712.727 2684.13 679.761 2703.87 631.72L2712.33 700.474H2812.98V418.067C2812.98 289.117 2735.87 221.335 2610.71 221.335C2485.55 221.335 2401.92 287.269 2401.92 388.018H2499.75C2499.75 339.102 2537.38 310.803 2605.07 310.803C2663.42 310.803 2701.05 336.185 2701.05 399.299V409.607L2561.79 419.915C2451.71 428.376 2389.66 482.056 2389.66 567.731ZM2096.95 607.311C2017.89 607.311 1966.15 549.838 1966.15 466.108C1966.15 382.377 2017.89 323.932 2096.95 323.932C2176.01 323.932 2225.8 383.253 2225.8 466.108C2225.8 548.963 2177.86 607.311 2096.95 607.311ZM1850.43 700.474H1956.72L1964.21 628.025C1991.53 681.705 2050.76 712.727 2120.39 712.727C2254 712.727 2341.43 613.827 2341.43 470.775C2341.43 327.724 2260.52 220.363 2127.87 220.363C2057.37 220.363 1995.23 251.385 1965.18 303.218V0H1850.43V700.474Z" fill="#FF2929" fill-rule="evenodd" />
    </svg>
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
            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #000000;
            }
        }
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0; padding: 0; line-height: 1.6; color: #000000; 
            background: #f5f5f5; min-height: 100vh; display: flex; flex-direction: column; align-items: center;
        }
        .page { 
            width: 210mm; min-height: 297mm; padding: 20mm; background: #ffffff; 
            page-break-after: always; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 297mm; }
        .logo { width: 200px; height: auto; margin-bottom: 40px; }
        .title { font-size: 2.5em; font-weight: 700; color: #000000; margin-bottom: 20px; }
        .subtitle { font-size: 1.2em; color: #666666; margin-bottom: 40px; }
        .cover-details { margin-top: 40px; }
        .cover-details p { font-size: 1em; color: #666666; margin-bottom: 12px; }
        .prepared-by { font-weight: 600; color: #000000; }
        .simulator-name { font-weight: 500; color: #000000; }
        .date { font-size: 1em; color: #666666; }
        .version { font-size: 0.9em; color: #666666; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 1.5em; font-weight: 600; color: #000000; margin-bottom: 15px; border-bottom: 2px solid #cccccc; padding-bottom: 10px; }
        .content { font-size: 1em; line-height: 1.6; color: #000000; }
        .divider { height: 1px; background: #cccccc; margin: 20px 0; }
        
        /* Table of Contents Styling */
        .toc-item { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 8px 0; border-bottom: 1px solid #cccccc; 
        }
        .toc-item a { 
            color: #000000; text-decoration: none; font-weight: 500;
        }
        .toc-item a:hover { text-decoration: underline; }
        .toc-page-number { 
            color: #666666; font-size: 0.9em; 
        }
        
        /* Pricing Colors */
        .price-original { color: #ff0000; text-decoration: line-through; }
        .price-free { color: #00aa00; font-weight: bold; }
        .price-discount { color: #ff0000; }
        .price-normal { color: #000000; }
        
        /* Page Footer */
        .page::after {
            content: "Page " counter(page) " of " counter(pages);
            position: absolute;
            bottom: 10mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #000000;
        }
        
        /* Disclaimer Footer */
        .disclaimer {
            position: absolute;
            bottom: 5mm;
            left: 20mm;
            right: 20mm;
            font-size: 8px;
            color: #666666;
            text-align: center;
            border-top: 1px solid #cccccc;
            padding-top: 5px;
        }
        
        /* Professional Pricing Table */
        .pricing-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .pricing-table th {
            background: #059669;
            color: white;
            font-weight: 600;
            padding: 12px 16px;
            text-align: left;
            font-size: 0.85em;
        }
        .pricing-table td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.85em;
        }
        .pricing-table tr:last-child td {
            border-bottom: none;
        }
        .pricing-table tr.total-row {
            background: #f8fafc;
            font-weight: 600;
        }
        .pricing-table tr.total-row td {
            border-top: 2px solid #059669;
        }
        
        /* Category Breakdown */
        .category-breakdown {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .category-item:last-child {
            border-bottom: none;
        }
        
        .category-name {
            font-weight: 500;
            color: #0f172a;
        }
        
        .category-total {
            font-weight: 600;
            color: #059669;
        }
        
        /* Discount Details */
        .discount-details {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
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
            color: #92400e;
            font-size: 0.9em;
        }
        
        .discount-amount {
            color: #dc2626;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        /* Savings Summary */
        .savings-summary {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 6px;
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
            color: #065f46;
            font-weight: 500;
        }
        
        .savings-amount {
            color: #059669;
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
        ${areebaLogoSVG}
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
      // // console.log('pdfHelpers: Found existing legacy template:', legacyTemplate.id);
      return legacyTemplate.id;
    }
    
    // Create a new legacy template
    // // console.log('pdfHelpers: Creating new legacy template for simulator:', simulatorType);
    const newTemplate = await PdfBuilderService.createTemplate({
      template_name: 'Legacy Template',
      simulator_type: simulatorType,
      section_ids: []
    });
    
    // // console.log('pdfHelpers: Created legacy template:', newTemplate.id);
    return newTemplate.id;
  } catch (error) {
    // // console.error('pdfHelpers: Failed to ensure legacy template:', error);
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
  // // console.log('pdfHelpers: Starting PDF generation...', data);
  
  // Get current system version
  let systemVersion = 'v2.2.0'; // fallback
  try {
    systemVersion = await VersionService.getCurrentVersion();
  } catch (error) {
    // // console.warn('Could not fetch system version, using fallback:', error);
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
    // // console.log('pdfHelpers: Using custom template content', safeData.customContent);
    htmlContent = generateCustomHTMLReport(safeData.customContent, safeData, systemVersion);
  } else {
    // Use legacy HTML generation
    // // console.log('pdfHelpers: Using legacy HTML generation - no custom content provided');
    htmlContent = generateHTMLReport(safeData, systemVersion);
  }
  
  // Save to database if we have the required data
  if (safeData.config?.clientName && safeData.config?.projectName && safeData.simulator?.id) {
    // // console.log('pdfHelpers: Attempting to save PDF to database...');
    try {
      // Import PdfBuilderService dynamically to avoid circular dependencies
      const { PdfBuilderService } = await import('../features/pdfBuilder/api/pdfBuilderService');
      
      let templateId: string;
      
      if (safeData.customContent) {
        // Use the active template ID from the custom content
        // // console.log('pdfHelpers: Using active template for custom content');
        const activeTemplate = await PdfBuilderService.getActiveTemplate(safeData.simulator.id);
        templateId = activeTemplate?.id || await ensureLegacyTemplate(safeData.simulator.id);
      } else {
        // Use legacy template for backward compatibility
        // // console.log('pdfHelpers: Using legacy template');
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
      // // console.log('pdfHelpers: Successfully saved PDF to database');
    } catch (error) {
      // // console.error('pdfHelpers: Failed to save PDF to database:', error);
      // Don't throw - we still want the PDF to be generated
    }
  } else {
    // console.log('pdfHelpers: Skipping database save - missing required data:', {
    //   clientName: safeData.config?.clientName,
    //   projectName: safeData.config?.projectName,
    //   simulatorId: safeData.simulator?.id
    // });
  }

  // Generate and download the PDF
  try {
    // // console.log('pdfHelpers: Generating PDF with HTML content length:', htmlContent.length);
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeData.config.clientName || 'Pricing'}-${safeData.config.projectName || 'Proposal'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    // console.log('pdfHelpers: PDF download initiated successfully');
  } catch (error) {
    // console.error('pdfHelpers: Failed to generate PDF:', error);
    throw error;
  }
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
