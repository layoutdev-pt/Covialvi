'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Calculator, Info, TrendingUp, Percent, Calendar, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default function MortgageCalculatorPage() {
  const t = useTranslations('mortgage');
  
  const [propertyValue, setPropertyValue] = useState(200000);
  const [downPayment, setDownPayment] = useState(40000);
  const [interestRate, setInterestRate] = useState(3.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const calculations = useMemo(() => {
    const loanAmount = propertyValue - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        loanAmount: 0,
      };
    }

    const monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      loanAmount,
    };
  }, [propertyValue, downPayment, interestRate, loanTerm]);

  const downPaymentPercentage = ((downPayment / propertyValue) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-foreground text-white py-16">
        <div className="container-wide">
          <div className="flex items-center mb-4">
            <Calculator className="h-8 w-8 mr-3 text-gold-400" />
            <h1 className="font-display text-display-lg">{t('title')}</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container-wide section-padding">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Empréstimo</CardTitle>
                <CardDescription>
                  Introduza os valores para simular o seu crédito habitação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Value */}
                <div className="space-y-2">
                  <Label htmlFor="propertyValue" className="flex items-center">
                    <Euro className="h-4 w-4 mr-2" />
                    {t('propertyValue')}
                  </Label>
                  <Input
                    id="propertyValue"
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    min={0}
                    step={1000}
                  />
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={5000}
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>€50.000</span>
                    <span>€1.000.000</span>
                  </div>
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <Label htmlFor="downPayment" className="flex items-center justify-between">
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {t('downPayment')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {downPaymentPercentage}%
                    </span>
                  </Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    min={0}
                    max={propertyValue}
                    step={1000}
                  />
                  <input
                    type="range"
                    min={0}
                    max={propertyValue * 0.5}
                    step={1000}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <Label htmlFor="interestRate" className="flex items-center">
                    <Percent className="h-4 w-4 mr-2" />
                    {t('interestRate')}
                  </Label>
                  <Input
                    id="interestRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={0}
                    max={15}
                    step={0.1}
                  />
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span>10%</span>
                  </div>
                </div>

                {/* Loan Term */}
                <div className="space-y-2">
                  <Label htmlFor="loanTerm" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('loanTerm')}
                  </Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    min={5}
                    max={40}
                  />
                  <input
                    type="range"
                    min={5}
                    max={40}
                    step={1}
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 anos</span>
                    <span>40 anos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Monthly Payment */}
            <Card className="bg-gold-500 text-white border-gold-500">
              <CardContent className="p-8 text-center">
                <p className="text-gold-100 mb-2">{t('monthlyPayment')}</p>
                <p className="text-5xl font-bold">
                  {formatPrice(calculations.monthlyPayment)}
                </p>
                <p className="text-gold-100 mt-2">por mês</p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Empréstimo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t('propertyValue')}</span>
                  <span className="font-semibold">{formatPrice(propertyValue)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t('downPayment')}</span>
                  <span className="font-semibold">{formatPrice(downPayment)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t('loanAmount')}</span>
                  <span className="font-semibold">{formatPrice(calculations.loanAmount)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t('totalInterest')}</span>
                  <span className="font-semibold text-orange-600">
                    {formatPrice(calculations.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">{t('totalPayment')}</span>
                  <span className="font-bold text-lg">{formatPrice(calculations.totalPayment)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="flex items-start p-4 bg-blue-50 rounded-lg text-sm">
              <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700">{t('disclaimer')}</p>
            </div>

            {/* CTA */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Precisa de ajuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Os nossos consultores podem ajudá-lo a encontrar a melhor solução de financiamento.
                </p>
                <Button variant="gold">Falar com um Consultor</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
