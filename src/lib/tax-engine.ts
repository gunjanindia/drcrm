import { TaxConfiguration, TaxMode, Invoice, InvoiceItem } from '@/types';

// Default initial Tax Configuration: Non-GST Bill of Supply Mode
export const initialTaxConfig: TaxConfiguration = {
  id: 'tax_cfg_dr_default',
  tenantId: 'tenant_digital_ranchi_main',
  isGstRegistered: false,
  gstin: null,
  registrationDate: null,
  defaultTaxMode: 'NON_GST',
  cgstRatePercent: 0.0,
  sgstRatePercent: 0.0,
  igstRatePercent: 0.0,
  defaultSacCode: '998313', // Information Technology & Marketing Consulting Services
  invoicePrefix: 'DR/BOS/',
  termsAndConditions: 'Composition / Non-GST Bill of Supply for Digital Services. GST is not currently applicable.',
};

export interface TaxCalculationResult {
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  taxMode: TaxMode;
  invoiceType: 'BILL_OF_SUPPLY' | 'TAX_INVOICE';
}

export class TaxEngine {
  private config: TaxConfiguration;

  constructor(config: TaxConfiguration = initialTaxConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: Partial<TaxConfiguration>): TaxConfiguration {
    this.config = { ...this.config, ...newConfig };
    if (this.config.isGstRegistered && this.config.defaultTaxMode === 'GST') {
      this.config.invoicePrefix = this.config.invoicePrefix.startsWith('DR/BOS')
        ? 'DR/TAX/'
        : this.config.invoicePrefix;
      this.config.termsAndConditions =
        'Tax Invoice issued in accordance with Section 31 of CGST Act. All subject to Ranchi jurisdiction.';
    }
    return this.config;
  }

  public getConfig(): TaxConfiguration {
    return this.config;
  }

  public calculateInvoiceTotals(
    items: Array<{ unitPrice: number; quantity: number; discount?: number }>,
    clientState: string = 'Jharkhand'
  ): TaxCalculationResult {
    const subtotal = items.reduce((sum, item) => {
      const discount = item.discount || 0;
      return sum + item.unitPrice * item.quantity - discount;
    }, 0);

    if (!this.config.isGstRegistered || this.config.defaultTaxMode === 'NON_GST') {
      return {
        subtotal,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        totalTax: 0,
        totalAmount: subtotal,
        taxMode: 'NON_GST',
        invoiceType: 'BILL_OF_SUPPLY',
      };
    }

    // GST is Active
    const isIntraState = clientState.trim().toLowerCase() === 'jharkhand';
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isIntraState) {
      cgstAmount = (subtotal * (this.config.cgstRatePercent || 9.0)) / 100;
      sgstAmount = (subtotal * (this.config.sgstRatePercent || 9.0)) / 100;
    } else {
      igstAmount = (subtotal * (this.config.igstRatePercent || 18.0)) / 100;
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const totalAmount = subtotal + totalTax;

    return {
      subtotal,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: Math.round(igstAmount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      taxMode: 'GST',
      invoiceType: 'TAX_INVOICE',
    };
  }
}

export const globalTaxEngine = new TaxEngine();
