'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  Home,
  Euro,
  Calendar,
  Percent,
  TrendingUp,
  Info,
  PiggyBank,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// IMT rates for Portugal 2024 - Habitação Própria Permanente (HPP)
// Source: Autoridade Tributária
const IMT_RATES_HPP = [
  { min: 0, max: 101917, rate: 0, deduction: 0 },
  { min: 101917, max: 139412, rate: 2, deduction: 2038.34 },
  { min: 139412, max: 190086, rate: 5, deduction: 6220.70 },
  { min: 190086, max: 316772, rate: 7, deduction: 10022.42 },
  { min: 316772, max: 633453, rate: 8, deduction: 13190.14 },
  { min: 633453, max: 1102920, rate: 6, deduction: 0 }, // Single rate
  { min: 1102920, max: Infinity, rate: 7.5, deduction: 0 }, // Single rate
];

// IMT rates for under 35 - Habitação Própria Permanente (HPP) - Jovens até 35 anos
const IMT_RATES_HPP_UNDER35 = [
  { min: 0, max: 101917, rate: 0, deduction: 0 }, // Isento
  { min: 101917, max: 152904, rate: 0, deduction: 0 }, // Isento até 150% do 1º escalão
  { min: 152904, max: 190086, rate: 5, deduction: 7645.20 },
  { min: 190086, max: 316772, rate: 7, deduction: 11449.92 },
  { min: 316772, max: 633453, rate: 8, deduction: 14617.64 },
  { min: 633453, max: 1102920, rate: 6, deduction: 0 },
  { min: 1102920, max: Infinity, rate: 7.5, deduction: 0 },
];

// IMT rates for secondary residence / investment
const IMT_RATES_SECONDARY = [
  { min: 0, max: 101917, rate: 1, deduction: 0 },
  { min: 101917, max: 139412, rate: 2, deduction: 1019.17 },
  { min: 139412, max: 190086, rate: 5, deduction: 5201.53 },
  { min: 190086, max: 316772, rate: 7, deduction: 9003.25 },
  { min: 316772, max: 607528, rate: 8, deduction: 12170.97 },
  { min: 607528, max: 1050400, rate: 6, deduction: 0 },
  { min: 1050400, max: Infinity, rate: 7.5, deduction: 0 },
];

// Imposto de Selo rate (Stamp Duty) - 0.8% on property value
const STAMP_DUTY_RATE = 0.8;

// Imposto de Selo on mortgage - 0.6% on loan amount
const STAMP_DUTY_MORTGAGE_RATE = 0.6;

export default function SimuladorCreditoPage() {
  // Form states
  const [propertyValue, setPropertyValue] = useState(200000);
  const [downPayment, setDownPayment] = useState(20);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(3.5);
  const [rateType, setRateType] = useState('variable');
  const [spread, setSpread] = useState(1.0);
  const [euribor, setEuribor] = useState(2.5);
  const [isUnder35, setIsUnder35] = useState(false);
  const [propertyPurpose, setPropertyPurpose] = useState<'hpp' | 'secondary'>('hpp');
  
  // Results
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);
  const [imtValue, setImtValue] = useState(0);
  const [stampDutyProperty, setStampDutyProperty] = useState(0);
  const [stampDutyMortgage, setStampDutyMortgage] = useState(0);
  const [showAmortization, setShowAmortization] = useState(false);
  const [showTaxes, setShowTaxes] = useState(true);
  const [amortizationTable, setAmortizationTable] = useState<any[]>([]);

  // Calculate effective rate based on type
  const effectiveRate = rateType === 'variable' ? euribor + spread : interestRate;

  // Calculate IMT (Imposto Municipal sobre Transmissões)
  const calculateIMT = (value: number, purpose: 'hpp' | 'secondary', under35: boolean): number => {
    let rates;
    if (purpose === 'hpp') {
      rates = under35 ? IMT_RATES_HPP_UNDER35 : IMT_RATES_HPP;
    } else {
      rates = IMT_RATES_SECONDARY;
    }

    const bracket = rates.find(r => value > r.min && value <= r.max) || rates[rates.length - 1];
    
    // For higher brackets with single rate (no deduction formula)
    if (bracket.min >= 633453 || (purpose === 'secondary' && bracket.min >= 607528)) {
      return value * (bracket.rate / 100);
    }
    
    // Standard formula: IMT = Value × Rate - Deduction
    return Math.max(0, value * (bracket.rate / 100) - bracket.deduction);
  };

  // Calculate mortgage and taxes
  useEffect(() => {
    const principal = propertyValue * (1 - downPayment / 100);
    setLoanAmount(principal);
    
    const monthlyRate = effectiveRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
      setTotalPayment(principal);
      setTotalInterest(0);
    } else {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      setMonthlyPayment(payment);
      setTotalPayment(payment * numberOfPayments);
      setTotalInterest(payment * numberOfPayments - principal);
    }

    // Calculate taxes
    const imt = calculateIMT(propertyValue, propertyPurpose, isUnder35);
    setImtValue(imt);
    
    // Stamp duty on property (0.8%)
    const stampProperty = propertyValue * (STAMP_DUTY_RATE / 100);
    setStampDutyProperty(stampProperty);
    
    // Stamp duty on mortgage (0.6%)
    const stampMortgage = principal * (STAMP_DUTY_MORTGAGE_RATE / 100);
    setStampDutyMortgage(stampMortgage);
    
    // Generate amortization table (first 12 months + summary)
    generateAmortizationTable(principal, effectiveRate, loanTerm);
  }, [propertyValue, downPayment, loanTerm, effectiveRate, propertyPurpose, isUnder35]);

  const generateAmortizationTable = (principal: number, rate: number, years: number) => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const table = [];
    let balance = principal;
    
    for (let month = 1; month <= Math.min(numberOfPayments, 12); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;
      
      table.push({
        month,
        payment: payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }
    
    setAmortizationTable(table);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDecimal = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate affordability indicators
  const maxRecommendedPayment = (income: number) => income * 0.35;
  const debtToIncomeRatio = 35; // Standard recommendation

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-6">
              <Calculator className="h-4 w-4" />
              Simulador de Crédito Habitação
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Calcule a sua prestação mensal
            </h1>
            <p className="text-xl text-muted-foreground">
              Simule o seu crédito habitação e descubra quanto pode pagar por mês. 
              Ajuste os valores e veja os resultados em tempo real.
            </p>

            {/* Disclaimer - Visible immediately */}
            <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Aviso:</strong> Este simulador apresenta valores estimados e não representa uma proposta de crédito real. 
                    Para uma cotação mais precisa, aconselhamos a <a href="/contacto" className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-100">contactar um representante</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Buyer Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-yellow-500" />
                    Perfil do Comprador
                  </CardTitle>
                  <CardDescription>
                    Informações que afetam os impostos e benefícios fiscais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Property Purpose */}
                  <div className="space-y-3">
                    <Label>Finalidade do Imóvel</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPropertyPurpose('hpp')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          propertyPurpose === 'hpp'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                            : 'border-border hover:border-yellow-200'
                        }`}
                      >
                        <p className="font-semibold text-foreground">Habitação Própria</p>
                        <p className="text-sm text-muted-foreground">Residência permanente</p>
                      </button>
                      <button
                        onClick={() => setPropertyPurpose('secondary')}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          propertyPurpose === 'secondary'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                            : 'border-border hover:border-yellow-200'
                        }`}
                      >
                        <p className="font-semibold text-foreground">Segunda Habitação</p>
                        <p className="text-sm text-muted-foreground">Investimento / Férias</p>
                      </button>
                    </div>
                  </div>

                  {/* Age Under 35 */}
                  {propertyPurpose === 'hpp' && (
                    <div className="space-y-3">
                      <Label>Tem menos de 35 anos?</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsUnder35(true)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isUnder35
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                              : 'border-border hover:border-green-200'
                          }`}
                        >
                          <p className="font-semibold text-foreground">Sim</p>
                          <p className="text-sm text-muted-foreground">Benefício fiscal no IMT</p>
                        </button>
                        <button
                          onClick={() => setIsUnder35(false)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            !isUnder35
                              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                              : 'border-border hover:border-yellow-200'
                          }`}
                        >
                          <p className="font-semibold text-foreground">Não</p>
                          <p className="text-sm text-muted-foreground">35 anos ou mais</p>
                        </button>
                      </div>
                      {isUnder35 && (
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
                          <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800 dark:text-green-200">
                            <strong>Benefício Jovem:</strong> Isenção de IMT até €152.904 para habitação própria permanente (Lei do OE 2024).
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5 text-yellow-500" />
                    Valor do Imóvel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[propertyValue]}
                        onValueChange={(v: number[]) => setPropertyValue(v[0])}
                        min={50000}
                        max={1000000}
                        step={5000}
                        className="[&_[role=slider]]:bg-yellow-500"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(Number(e.target.value))}
                        className="text-right font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>50.000 €</span>
                    <span>1.000.000 €</span>
                  </div>
                </CardContent>
              </Card>

              {/* Down Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PiggyBank className="h-5 w-5 text-yellow-500" />
                    Entrada (Capitais Próprios)
                  </CardTitle>
                  <CardDescription>
                    Recomendado: mínimo 10% do valor do imóvel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[downPayment]}
                        onValueChange={(v: number[]) => setDownPayment(v[0])}
                        min={0}
                        max={90}
                        step={1}
                        className="[&_[role=slider]]:bg-yellow-500"
                      />
                    </div>
                    <div className="w-24 flex items-center gap-1">
                      <Input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="text-right font-semibold"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Entrada: {formatCurrency(propertyValue * downPayment / 100)}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Financiamento: {formatCurrency(propertyValue * (1 - downPayment / 100))}
                    </span>
                  </div>
                  {downPayment < 10 && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-yellow-800 dark:text-yellow-200">
                        A maioria dos bancos exige uma entrada mínima de 10% do valor do imóvel.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Term */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                    Prazo do Empréstimo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[loanTerm]}
                        onValueChange={(v: number[]) => setLoanTerm(v[0])}
                        min={5}
                        max={40}
                        step={1}
                        className="[&_[role=slider]]:bg-yellow-500"
                      />
                    </div>
                    <div className="w-28 flex items-center gap-1">
                      <Input
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="text-right font-semibold"
                      />
                      <span className="text-muted-foreground text-sm">anos</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5 anos</span>
                    <span>40 anos</span>
                  </div>
                </CardContent>
              </Card>

              {/* Interest Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Percent className="h-5 w-5 text-yellow-500" />
                    Taxa de Juro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setRateType('variable')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        rateType === 'variable'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                          : 'border-border hover:border-yellow-200'
                      }`}
                    >
                      <p className="font-semibold text-foreground">Taxa Variável</p>
                      <p className="text-sm text-muted-foreground">Euribor + Spread</p>
                    </button>
                    <button
                      onClick={() => setRateType('fixed')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        rateType === 'fixed'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                          : 'border-border hover:border-yellow-200'
                      }`}
                    >
                      <p className="font-semibold text-foreground">Taxa Fixa</p>
                      <p className="text-sm text-muted-foreground">Taxa constante</p>
                    </button>
                  </div>

                  {rateType === 'variable' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Euribor (12 meses)</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={euribor}
                              onChange={(e) => setEuribor(Number(e.target.value))}
                              className="text-right"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Spread</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={spread}
                              onChange={(e) => setSpread(Number(e.target.value))}
                              className="text-right"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Taxa Anual Efetiva: <span className="font-semibold text-foreground">{(euribor + spread).toFixed(2)}%</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Taxa Fixa Anual</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Slider
                            value={[interestRate]}
                            onValueChange={(v: number[]) => setInterestRate(v[0])}
                            min={1}
                            max={10}
                            step={0.1}
                            className="[&_[role=slider]]:bg-yellow-500"
                          />
                        </div>
                        <div className="w-24 flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="text-right font-semibold"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="sticky top-24">
                {/* Main Result Card */}
                <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Resultado da Simulação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-2">Prestação Mensal</p>
                      <motion.p 
                        key={monthlyPayment}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-bold text-foreground"
                      >
                        {formatCurrencyDecimal(monthlyPayment)}
                      </motion.p>
                      <p className="text-sm text-muted-foreground mt-2">
                        durante {loanTerm} anos ({loanTerm * 12} meses)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Valor do Imóvel</span>
                        <span className="font-semibold">{formatCurrency(propertyValue)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Entrada ({downPayment}%)</span>
                        <span className="font-semibold">{formatCurrency(propertyValue * downPayment / 100)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Montante Financiado</span>
                        <span className="font-semibold text-yellow-600">{formatCurrency(loanAmount)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Taxa de Juro</span>
                        <span className="font-semibold">{effectiveRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">Total de Juros</span>
                        <span className="font-semibold text-red-500">{formatCurrency(totalInterest)}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-muted-foreground">Total a Pagar (Crédito)</span>
                        <span className="font-bold text-lg">{formatCurrency(totalPayment)}</span>
                      </div>
                    </div>

                    {/* Taxes Section */}
                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => setShowTaxes(!showTaxes)}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          <Receipt className="h-4 w-4 text-yellow-500" />
                          Impostos e Custos de Aquisição
                        </span>
                        {showTaxes ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {showTaxes && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 mt-4">
                              <div className="flex justify-between py-2">
                                <span className="text-muted-foreground text-sm flex items-center gap-1">
                                  IMT
                                  {isUnder35 && propertyPurpose === 'hpp' && (
                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                                      Jovem
                                    </span>
                                  )}
                                </span>
                                <span className={`font-semibold ${imtValue === 0 ? 'text-green-600' : ''}`}>
                                  {imtValue === 0 ? 'Isento' : formatCurrency(imtValue)}
                                </span>
                              </div>
                              <div className="flex justify-between py-2">
                                <span className="text-muted-foreground text-sm">Imposto de Selo (Imóvel)</span>
                                <span className="font-semibold">{formatCurrency(stampDutyProperty)}</span>
                              </div>
                              <div className="flex justify-between py-2">
                                <span className="text-muted-foreground text-sm">Imposto de Selo (Crédito)</span>
                                <span className="font-semibold">{formatCurrency(stampDutyMortgage)}</span>
                              </div>
                              <div className="flex justify-between py-3 border-t border-border mt-2">
                                <span className="text-muted-foreground font-medium">Total Impostos</span>
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(imtValue + stampDutyProperty + stampDutyMortgage)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Total Investment */}
                            <div className="mt-4 p-4 bg-secondary rounded-xl">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-foreground">Investimento Inicial Total</span>
                                <span className="text-xl font-bold text-foreground">
                                  {formatCurrency(
                                    propertyValue * downPayment / 100 + 
                                    imtValue + 
                                    stampDutyProperty + 
                                    stampDutyMortgage
                                  )}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Entrada + Impostos (não inclui custos notariais e registos)
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Visual breakdown */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Composição do Pagamento Total</p>
                      <div className="h-4 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-yellow-500 transition-all"
                          style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                        />
                        <div 
                          className="bg-red-400 transition-all"
                          style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-yellow-500" />
                          Capital ({((loanAmount / totalPayment) * 100).toFixed(0)}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-red-400" />
                          Juros ({((totalInterest / totalPayment) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amortization Table Toggle */}
                <Card className="mt-6">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setShowAmortization(!showAmortization)}
                  >
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-yellow-500" />
                        Tabela de Amortização
                      </span>
                      {showAmortization ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <AnimatePresence>
                    {showAmortization && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Primeiros 12 meses do empréstimo
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 font-medium text-muted-foreground">Mês</th>
                                  <th className="text-right py-2 font-medium text-muted-foreground">Prestação</th>
                                  <th className="text-right py-2 font-medium text-muted-foreground">Capital</th>
                                  <th className="text-right py-2 font-medium text-muted-foreground">Juros</th>
                                </tr>
                              </thead>
                              <tbody>
                                {amortizationTable.map((row) => (
                                  <tr key={row.month} className="border-b border-border/50">
                                    <td className="py-2">{row.month}</td>
                                    <td className="text-right py-2">{formatCurrencyDecimal(row.payment)}</td>
                                    <td className="text-right py-2 text-yellow-600">{formatCurrencyDecimal(row.principal)}</td>
                                    <td className="text-right py-2 text-red-500">{formatCurrencyDecimal(row.interest)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* Disclaimer Card */}
                <Card className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-2">Aviso Importante</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Este simulador apresenta <strong>valores estimados</strong> e não representa uma proposta de crédito real. 
                          Os valores finais podem variar consoante as condições oferecidas por cada instituição bancária, 
                          a sua situação financeira, e outros fatores.
                        </p>
                        <a 
                          href="/contacto" 
                          className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          Contacte-nos para obter mais informações →
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-6 md:px-12 lg:px-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">Dicas para o seu Crédito Habitação</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                  <PiggyBank className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Poupe para a Entrada</h3>
                <p className="text-sm text-muted-foreground">
                  Quanto maior for a sua entrada, menor será o montante a financiar e, 
                  consequentemente, os juros a pagar. Tente poupar pelo menos 20% do valor do imóvel.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Compare Propostas</h3>
                <p className="text-sm text-muted-foreground">
                  Não aceite a primeira proposta. Compare as condições de vários bancos, 
                  incluindo spreads, seguros e comissões. Pequenas diferenças podem significar 
                  milhares de euros ao longo do empréstimo.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Taxa de Esforço</h3>
                <p className="text-sm text-muted-foreground">
                  A prestação mensal não deve ultrapassar 35% do seu rendimento líquido. 
                  Mantenha uma margem de segurança para imprevistos e variações nas taxas de juro.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Encontrou o valor ideal?
          </h2>
          <p className="text-muted-foreground mb-8">
            Explore os nossos imóveis e encontre a casa perfeita para o seu orçamento.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-foreground text-background hover:opacity-90">
              <a href={`/imoveis?max_price=${propertyValue}`}>
                Ver Imóveis até {formatCurrency(propertyValue)}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/contacto">
                Falar com um Consultor
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
