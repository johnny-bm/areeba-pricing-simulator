import { ClientConfig, DynamicClientConfig, SelectedItem, Category, ConfigurationDefinition } from '../types/pricing';
import { formatPrice } from './formatters';
import { calculateTieredPrice } from './tieredPricing';

const APP_VERSION = '1.1.0';

interface PDFData {
  config: DynamicClientConfig;
  legacyConfig?: ClientConfig; // For backward compatibility
  configDefinitions?: ConfigurationDefinition[]; // To display dynamic fields properly
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  globalDiscountApplication: 'none' | 'both' | 'monthly' | 'onetime';
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
  };
}

export function downloadPDF(data: PDFData) {
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
    summary: data.summary || {
      oneTimeTotal: 0,
      monthlyTotal: 0,
      yearlyTotal: 0,
      totalProjectCost: 0
    }
  };
  
  // Create HTML content for the PDF
  const htmlContent = generateHTMLReport(safeData);
  
  // Create a new window/tab and print it
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Use setTimeout to ensure content is fully loaded
    setTimeout(() => {
      try {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing (user can cancel)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
        
        // Fallback: close window after 30 seconds if user doesn't close it
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 30000);
      } catch (error) {
        console.error('Error printing PDF:', error);
        // Fallback: just leave the window open for manual printing
      }
    }, 500);
  } else {
    console.error('Could not open print window. Please check popup blockers.');
    alert('Could not open print window. Please check your popup blocker settings and try again.');
  }
}

function generateConfigurationHTML(data: PDFData): string {
  // Always show core client details
  let configHTML = `
    <div class="config-grid">
      <div>
        <strong>Client Details:</strong><br>
        Client Name: ${data.config?.clientName || 'Not specified'}<br>
        Project Name: ${data.config?.projectName || 'Not specified'}<br>
        Prepared By: ${data.config?.preparedBy || 'Not specified'}
      </div>
  `;

  // If we have config definitions, display them organized by configuration card
  if (data.configDefinitions && data.configDefinitions.length > 0) {
    const sortedConfigurations = [...data.configDefinitions]
      .filter(config => config.isActive)
      .sort((a, b) => a.order - b.order);

    configHTML += `
      <div>
        <strong>Configuration Details:</strong><br>
    `;

    sortedConfigurations.forEach(configDef => {
      configHTML += `
        <div style="margin-bottom: 12px;">
          <strong style="font-size: 13px; color: #374151;">${configDef.name}:</strong><br>
      `;

      const sortedFields = [...configDef.fields].sort((a, b) => a.order - b.order);
      
      sortedFields.forEach(field => {
        const value = data.config?.configValues?.[field.id];
        let displayValue = 'Not set';
        
        if (value !== undefined && value !== null) {
          if (field.type === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          } else if (field.type === 'number') {
            displayValue = (value as number).toLocaleString();
          } else {
            displayValue = String(value);
          }
        }

        configHTML += `
          <div style="font-size: 12px; margin: 2px 0 2px 8px; color: #666;">
            ${field.name}: ${displayValue}
          </div>
        `;
      });

      configHTML += `</div>`;
    });

    configHTML += `</div>`;
  } else {
    // Fallback to legacy format if no config definitions available
    const legacyConfig = data.legacyConfig || convertDynamicToLegacy(data.config);
    configHTML += `
      <div>
        <strong>Card Types:</strong><br>
        Debit Cards: ${legacyConfig?.hasDebitCards ? `Yes (${legacyConfig?.debitCards?.toLocaleString() || '0'})` : 'No'}<br>
        Credit Cards: ${legacyConfig?.hasCreditCards ? `Yes (${legacyConfig?.creditCards?.toLocaleString() || '0'})` : 'No'}
      </div>
    `;
  }

  configHTML += `</div>`;

  // Show legacy volumes section if we don't have dynamic config or if legacy values exist
  if (!data.configDefinitions || data.legacyConfig) {
    const legacyConfig = data.legacyConfig || convertDynamicToLegacy(data.config);
    if ((legacyConfig?.monthlyAuthorizations || 0) > 0 || (legacyConfig?.monthlySettlements || 0) > 0 || 
        (legacyConfig?.monthly3DS || 0) > 0 || (legacyConfig?.monthlySMS || 0) > 0 || 
        (legacyConfig?.monthlyNotifications || 0) > 0 || (legacyConfig?.monthlyDeliveries || 0) > 0) {
      
      configHTML += `
        <div style="margin-top: 16px;">
          <strong>Monthly Volumes:</strong><br>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 12px;">
            <div>Authorizations: ${(legacyConfig?.monthlyAuthorizations || 0).toLocaleString()}</div>
            <div>Settlements: ${(legacyConfig?.monthlySettlements || 0).toLocaleString()}</div>
            <div>3DS Transactions: ${(legacyConfig?.monthly3DS || 0).toLocaleString()}</div>
            <div>SMS Notifications: ${(legacyConfig?.monthlySMS || 0).toLocaleString()}</div>
            <div>Push Notifications: ${(legacyConfig?.monthlyNotifications || 0).toLocaleString()}</div>
            <div>Card Deliveries: ${(legacyConfig?.monthlyDeliveries || 0).toLocaleString()}</div>
          </div>
        </div>
      `;
    }
  }

  return configHTML;
}

function generateGlobalDiscountHTML(data: PDFData): string {
  if (data.globalDiscount <= 0) return '';
  
  let applicationText = '';
  switch (data.globalDiscountApplication) {
    case 'both':
      applicationText = ' (Applied to both one-time and monthly costs)';
      break;
    case 'monthly':
      applicationText = ' (Applied to monthly costs only)';
      break;
    case 'onetime':
      applicationText = ' (Applied to one-time costs only)';
      break;
    default:
      applicationText = '';
      break;
  }

  return `
    <div style="margin-top: 16px; padding: 8px; background: #fef3c7; border-radius: 4px;">
      <strong>Global Discount Applied:</strong> ${data.globalDiscount}${data.globalDiscountType === 'percentage' ? '%' : '$'}${applicationText}
    </div>
  `;
}

function convertDynamicToLegacy(dynamicConfig: DynamicClientConfig): ClientConfig {
  return {
    clientName: dynamicConfig?.clientName || '',
    projectName: dynamicConfig?.projectName || '',
    preparedBy: dynamicConfig?.preparedBy || '',
    hasDebitCards: (dynamicConfig?.configValues?.hasDebitCards as boolean) || false,
    hasCreditCards: (dynamicConfig?.configValues?.hasCreditCards as boolean) || false,
    debitCards: (dynamicConfig?.configValues?.debitCards as number) || 0,
    creditCards: (dynamicConfig?.configValues?.creditCards as number) || 0,
    monthlyAuthorizations: (dynamicConfig?.configValues?.monthlyAuthorizations as number) || 0,
    monthlySettlements: (dynamicConfig?.configValues?.monthlySettlements as number) || 0,
    monthly3DS: (dynamicConfig?.configValues?.monthly3DS as number) || 0,
    monthlySMS: (dynamicConfig?.configValues?.monthlySMS as number) || 0,
    monthlyNotifications: (dynamicConfig?.configValues?.monthlyNotifications as number) || 0,
    monthlyDeliveries: (dynamicConfig?.configValues?.monthlyDeliveries as number) || 0
  };
}

function generateHTMLReport(data: PDFData): string {
  const calculateRowTotal = (selectedItem: SelectedItem) => {
    if (selectedItem.isFree) return 0;
    
    let subtotal: number;
    
    // Calculate subtotal: Quantity × Current Unit Price (same for both tiered and simple pricing)
    subtotal = selectedItem.quantity * selectedItem.unitPrice;
    
    let discountAmount = 0;
    if (selectedItem.discountType === 'percentage') {
      discountAmount = subtotal * (selectedItem.discount / 100);
    } else {
      // Fixed discount per unit (same for both tiered and simple pricing)
      discountAmount = selectedItem.discount * selectedItem.quantity;
    }
    
    return Math.max(0, subtotal - discountAmount);
  };

  // Group items by category
  const groupedItems = data.selectedItems.reduce((acc, item) => {
    const category = item.item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  // Create sorted categories based on order_index
  const sortedCategories = [...data.categories].sort((a, b) => a.order_index - b.order_index);

  const servicesHTML = sortedCategories.map(category => {
    const categoryItems = groupedItems[category.id];
    if (!categoryItems || categoryItems.length === 0) return '';

    const itemsHTML = categoryItems.map(item => {
      const rowTotal = calculateRowTotal(item);
      const originalPrice = (() => {
        if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
          const tieredResult = calculateTieredPrice(item.item, item.quantity);
          return tieredResult.totalPrice;
        }
        return item.quantity * item.unitPrice;
      })();
      const hasDiscount = !item.isFree && item.discount > 0;

      let statusBadge = '';
      if (item.isFree) {
        statusBadge = '<span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">FREE</span>';
      } else if (hasDiscount) {
        statusBadge = '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">DISCOUNTED</span>';
      }

      let priceHTML = formatPrice(rowTotal);
      if (hasDiscount || item.isFree) {
        priceHTML = `<span style="text-decoration: line-through; color: #666; margin-right: 8px;">${formatPrice(originalPrice)}</span>${formatPrice(rowTotal)}`;
      }

      const discountText = item.discount > 0 ? `${item.discount}${item.discountType === 'percentage' ? '%' : '$'}` : '-';

      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; vertical-align: top;">
            <div style="font-weight: 500; margin-bottom: 4px;">
              ${item.item.name} ${statusBadge}
              ${item.item.pricingType === 'tiered' ? '<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500; margin-left: 4px;">📊 TIERED</span>' : ''}
            </div>
            <div style="font-size: 12px; color: #666;">
              ${item.item.description}
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 2px;">
              ${item.item.unit}
            </div>
          </td>
          <td style="padding: 12px 8px; text-align: center;">${item.quantity.toLocaleString()}</td>
          <td style="padding: 12px 8px; text-align: right;">${formatPrice(item.unitPrice)}</td>
          <td style="padding: 12px 8px; text-align: center;">${discountText}</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: 500;">${priceHTML}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${category.color}; display: inline-block;"></div>
          ${category.name}
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 8px; text-align: left; font-weight: 600;">Service</th>
              <th style="padding: 8px; text-align: center; font-weight: 600;">Qty</th>
              <th style="padding: 8px; text-align: right; font-weight: 600;">Unit Price</th>
              <th style="padding: 8px; text-align: center; font-weight: 600;">Discount</th>
              <th style="padding: 8px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
    `;
  }).filter(Boolean).join('');

  // Areeba logo SVG for PDF
  const areebaLogoSVG = `
    <svg width="120" height="32" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 2821 720" style="margin: 0 auto 16px auto; display: block;">
      <path clip-rule="evenodd" d="M312.359 512.203C312.359 583.777 267.236 626.08 196.635 626.08C144.899 626.08 116.697 605.366 116.697 562.966C116.697 525.331 144.024 501.797 215.501 495.185L312.359 487.697V512.203ZM0 567.731C0 655.254 60.1963 712.727 159 712.727C231.449 712.727 294.466 679.761 314.207 631.72L322.667 700.474H423.319V418.067C423.319 289.117 346.201 221.335 221.044 221.335C95.8861 221.335 12.2532 287.172 12.2532 387.921H110.084C110.084 339.005 147.719 310.706 215.403 310.706C273.752 310.706 311.387 336.088 311.387 399.201V409.51L172.128 419.818C62.044 428.278 0 481.959 0 567.634L0 567.731ZM796.36 233.491V339.88H754.058C671.3 339.88 619.564 384.128 619.564 474.471V700.474H504.812V236.312H612.951L619.564 304.093C639.306 257.998 683.553 226.879 745.597 226.879C761.546 226.879 777.592 228.726 796.36 233.491ZM931.146 421.86C942.426 352.231 983.854 315.471 1051.54 315.471C1119.22 315.471 1164.44 357.871 1164.44 421.86H931.146ZM819.214 467.955C819.214 611.979 916.072 712.727 1054.36 712.727C1175.72 712.727 1260.33 651.559 1280.17 549.838H1173.88C1160.75 594.085 1119.32 618.592 1056.3 618.592C980.061 618.592 936.786 577.164 928.325 495.282L1278.22 494.309V459.495C1278.22 314.499 1189.82 221.335 1050.57 221.335C911.307 221.335 819.116 322.084 819.116 468.053L819.214 467.955ZM1553.53 315.471C1485.85 315.471 1444.42 352.231 1433.14 421.86H1666.43C1666.43 357.871 1622.19 315.471 1553.53 315.471ZM1556.35 712.727C1418.06 712.727 1321.21 611.979 1321.21 467.955C1321.21 323.932 1416.22 221.238 1552.65 221.238C1689.09 221.238 1780.31 314.401 1780.31 459.398V494.212L1430.41 495.185C1438.88 577.067 1482.15 618.495 1558.39 618.495C1621.41 618.495 1662.84 593.988 1675.96 549.741H1782.26C1762.52 651.461 1677.81 712.63 1556.45 712.63L1556.35 712.727ZM2702.9 512.203C2702.9 583.777 2657.78 626.08 2587.17 626.08C2535.44 626.80 2507.24 605.366 2507.24 562.966C2507.24 525.331 2534.56 501.797 2606.04 495.185L2702.9 487.697V512.203ZM2389.66 567.731C2389.66 655.254 2449.86 712.727 2548.66 712.727C2621.11 712.727 2684.13 679.761 2703.87 631.72L2712.33 700.474H2812.98V418.067C2812.98 289.117 2735.87 221.335 2610.71 221.335C2485.55 221.335 2401.92 287.269 2401.92 388.018H2499.75C2499.75 339.102 2537.38 310.803 2605.07 310.803C2663.42 310.803 2701.05 336.185 2701.05 399.299V409.607L2561.79 419.915C2451.71 428.376 2389.66 482.056 2389.66 567.731ZM2096.95 607.311C2017.89 607.311 1966.15 549.838 1966.15 466.108C1966.15 382.377 2017.89 323.932 2096.95 323.932C2176.01 323.932 2225.8 383.253 2225.8 466.108C2225.8 548.963 2177.86 607.311 2096.95 607.311ZM1850.43 700.474H1956.72L1964.21 628.025C1991.53 681.705 2050.76 712.727 2120.39 712.727C2254 712.727 2341.43 613.827 2341.43 470.775C2341.43 327.724 2260.52 220.363 2127.87 220.363C2057.37 220.363 1995.23 251.385 1965.18 303.218V0H1850.43V700.474Z" fill="#FF2929" fill-rule="evenodd" />
    </svg>
  `;

  // Generate timestamp with timezone
  const now = new Date();
  const formattedDateTime = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>areeba Pricing Simulator Report</title>
      <style>
        @media print {
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.4;
          color: #111827;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
        }
        .config-section, .summary-section {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 12px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .summary-total {
          font-weight: 600;
          font-size: 16px;
          background: #1f2937;
          color: white;
          padding: 12px;
          border-radius: 4px;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${areebaLogoSVG}
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">areeba Pricing Simulator Report</h1>
        <p style="margin: 0; color: #666; font-size: 14px;">Generated on ${formattedDateTime}</p>
      </div>

      <div class="config-section">
        <h2 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Client Configuration</h2>
        ${generateConfigurationHTML(data)}
        ${generateGlobalDiscountHTML(data)}
      </div>

      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Selected Services</h2>
        ${servicesHTML}
      </div>

      <div class="summary-section">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Cost Summary</h2>
        <div class="summary-item">
          <span>One-time Setup Costs:</span>
          <span style="font-weight: 500;">${formatPrice(data.summary.oneTimeTotal)}</span>
        </div>
        <div class="summary-item">
          <span>Monthly Recurring Costs:</span>
          <span style="font-weight: 500;">${formatPrice(data.summary.monthlyTotal)}</span>
        </div>
        <div class="summary-item" style="border-bottom: none;">
          <span>Annual Recurring Costs:</span>
          <span style="font-weight: 500;">${formatPrice(data.summary.yearlyTotal)}</span>
        </div>
        <div class="summary-total">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Project Cost (Setup + Year 1):</span>
            <span>${formatPrice(data.summary.totalProjectCost)}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        Generated by areeba Pricing Simulator v${APP_VERSION}
      </div>
    </body>
    </html>
  `;
}