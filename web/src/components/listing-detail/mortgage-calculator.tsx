"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Phone } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { CountUp } from "../motion/count-up";

interface MortgageCalculatorProps {
  priceBaht: number;
  className?: string;
}

export function MortgageCalculator({ priceBaht, className }: MortgageCalculatorProps) {
  const [downPercent, setDownPercent] = useState(10);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const result = useMemo(() => {
    const downPayment = priceBaht * (downPercent / 100);
    const loanAmount = priceBaht - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;

    // Standard mortgage formula: M = P * r * (1+r)^n / ((1+r)^n - 1)
    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalPayments;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalPayments);
      monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
    }

    const totalCost = monthlyPayment * totalPayments;
    const totalInterest = totalCost - loanAmount;

    return {
      downPayment,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      principalPercent: Math.round((loanAmount / totalCost) * 100),
    };
  }, [priceBaht, downPercent, interestRate, termYears]);

  // SVG donut chart
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const principalArc = (result.principalPercent / 100) * circumference;
  const interestArc = circumference - principalArc;

  return (
    <div className={cn("rounded-3xl border border-line bg-white p-6 shadow-card dark:bg-surface-raised", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          <Calculator className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">คำนวณสินเชื่อ</h3>
          <p className="text-xs text-ink-muted">ราคา {formatPrice(priceBaht)}</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <SliderRow
          label="เงินดาวน์"
          value={downPercent}
          min={5}
          max={50}
          step={5}
          unit="%"
          displayValue={`${downPercent}% · ฿${(result.downPayment / 1e6).toFixed(1)}M`}
          onChange={setDownPercent}
        />
        <SliderRow
          label="อัตราดอกเบี้ย"
          value={interestRate}
          min={2}
          max={12}
          step={0.25}
          unit="%"
          displayValue={`${interestRate}%`}
          onChange={setInterestRate}
        />
        <SliderRow
          label="ระยะเวลา"
          value={termYears}
          min={5}
          max={35}
          step={5}
          unit="ปี"
          displayValue={`${termYears} ปี`}
          onChange={setTermYears}
        />
      </div>

      {/* Result card */}
      <motion.div
        layout
        className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 via-white to-accent-50 p-5 dark:from-brand-900/20 dark:via-surface-raised dark:to-accent-900/10"
      >
        <div className="flex items-center gap-5">
          {/* Donut chart */}
          <div className="relative shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" className="rotate-[-90deg]">
              {/* Interest arc (background) */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="14"
                className="text-accent-200 dark:text-accent-800/30"
                strokeDasharray={`${interestArc} ${principalArc}`}
                strokeDashoffset={-principalArc}
                strokeLinecap="round"
              />
              {/* Principal arc */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="url(#brandGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${principalArc} ${interestArc}` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">ผ่อน/เดือน</span>
              <span className="font-display text-lg font-bold text-ink">
                ฿{(result.monthlyPayment / 1000).toFixed(1)}K
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2">
            <div>
              <div className="text-xs text-ink-muted">ผ่อนต่อเดือนประมาณ</div>
              <div className="font-display text-2xl font-bold text-ink">
                ฿{result.monthlyPayment.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-brand" />
                <span className="text-ink-muted">เงินต้น ฿{(result.loanAmount / 1e6).toFixed(1)}M</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-300" />
                <span className="text-ink-muted">ดอกเบี้ย ฿{(result.totalInterest / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition-all hover:bg-brand-100 hover:shadow-soft dark:border-brand-800/40 dark:bg-brand-900/20 dark:text-brand-200 dark:hover:bg-brand-900/40">
        <Phone className="h-4 w-4" />
        ปรึกษาสินเชื่อ
      </button>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">{displayValue}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mortgage-slider w-full"
        />
        {/* Filled track overlay */}
        <div
          className="pointer-events-none absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-gradient-brand"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
