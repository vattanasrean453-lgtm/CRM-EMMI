"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  FileText,
  Trophy,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Target,
  Award,
  Sparkles,
  MapPin,
  Clock,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
  User,
  Truck,
  Bot,
  Copy,
  RotateCcw,
  HeartPulse,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  purchaseDate: string;
  sellerId: string;
  status: string;
  boxes: number;
  nextFollowUp: string;
  expectedOutDate: string;
  followUpCount: number;
  isNearRunout: boolean;
  isDueToday: boolean;
  isOverdue: boolean;
  overdueDays: number;
  daysSincePurchase?: number;
  notes?: string;
}

interface Sale {
  id: string;
  date: string;
  product: string;
  team: string;
  seller: string;
  quantity: number;
  location?: string;
  phone?: string;
  customerName?: string;
}

interface Report {
  id: string;
  seller: string;
  date: string;
  chatGuests: number;
  chatTarget: number;
  oldCustomerBoxes: number;
  soldCount: number;
  activities: string;
  submittedAt: string;
}

interface FollowUpEvent {
  id: string;
  customerId: string;
  buyerName: string;
  phone: string;
  location: string;
  seller: string;
  followUpDate: string;
  method: string;
  status: string;
  boxes: number;
  nextFollowUp: string;
  expectedRunout: string;
  note: string;
  updatedAt: string;
}

interface UserOption {
  id: string;
  name: string;
  role: "admin" | "seller";
  title: string;
  initials: string;
  goal?: number;
}

const ALL_USERS: UserOption[] = [
  { id: "u0", name: "EMMI Admin", role: "admin", title: "Administrator", initials: "AD" },
  { id: "u1", name: "Sok Chakriya", role: "seller", title: "Seller", initials: "SC", goal: 250 },
  { id: "u2", name: "Porch Srey Neat", role: "seller", title: "Seller", initials: "PS", goal: 350 },
  { id: "u3", name: "Lorn The", role: "seller", title: "Seller", initials: "LT", goal: 200 },
  { id: "u4", name: "Reaksa", role: "seller", title: "Seller", initials: "RK", goal: 200 },
  { id: "u5", name: "Leas Sreypov", role: "seller", title: "Seller", initials: "LS", goal: 150 },
  { id: "u6", name: "Seav Pinh", role: "seller", title: "Seller", initials: "SP", goal: 200 },
  { id: "u7", name: "Chan Sreypov", role: "seller", title: "Seller", initials: "CS", goal: 100 },
  { id: "u8", name: "Rachana", role: "seller", title: "Seller", initials: "RC", goal: 150 },
];

const ORDER_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd_hP30dqB-F5gCV44AuxcftgmoDjo5zzkN-NSMiK-1rDEqPQ/viewform?usp=header";

// Products matching Company Master Data
const PRODUCT_OPTIONS = [
  { id: "Emmi", name: "Emmi", desc: "ជំនួយសម្រស់នារី & សុខភាព", defaultPrice: "25$" },
  { id: "Kidney Pro", name: "Kidney Pro", desc: "ជំនួយសុខភាពតម្រងនោម", defaultPrice: "25$" },
  { id: "Pro D.O", name: "Pro D.O", desc: "ប្រូ ឌី.អូ (Pro D.O)", defaultPrice: "25$" },
  { id: "Kidney+Pro D.O", name: "Kidney+Pro D.O", desc: "ឈុតរួមគ្នាពិសេស", defaultPrice: "50$" },
];

// Options matching Google Order Form schema (Exact standard teams)
const TEAM_OPTIONS = [
  "Vann_Sitha",
  "Bech_Nora",
  "Vann_Thida",
  "V_Thida_Emmi",
  "Chhorn_Dara",
  "Meng_Samoeuk",
  "Chhoun_Vireak",
  "La_Thida",
  "Nhem_Somrith",
  "N_Somrith_Emmi",
  "Yat_Virakyuth",
  "Sarun_Chhayhor",
  "S_Chhayhor_Emmi",
  "Hong_Heng_Oeurn",
  "Heng_Oeun_Emmi",
  "Kru_Ta",
  "Long_Vuthy",
  "L_Vuthy_Emmi",
  "Sorn_Sabda",
  "Teng_Toeun",
  "Vann_Theary",
  "T_Toeun_Emmi",
];

const DELIVERY_OPTIONS = [
  { id: "VET", label: "VET (វីរៈប៊ុនថាំ)", sub: "សេវាទូទៅ" },
  { id: "J&T", label: "J&T Express", sub: "សេវាទូទៅ" },
  { id: "Moto", label: "Moto (ម៉ូតូដឹក)", sub: "ភ្នំពេញ" },
  { id: "VET(COD)", label: "VET (COD)", sub: "ប្រមូលប្រាក់ពេលដល់" },
  { id: "J&T (COD)", label: "J&T (COD)", sub: "ប្រមូលប្រាក់ពេលដល់" },
  { id: "Thai ✅COD", label: "Thai ✅COD", sub: "ប្រទេសថៃ (COD)" },
  { id: "Thai ❌COD", label: "Thai ❌COD", sub: "ប្រទេសថៃ (វេរប្រាក់មុន)" },
];

// Categorized consultation scenarios grounded in the 17 Lessons of «សៀវភៅ រោគស្ត្រី» (អគ្គនាយក វណ្ណ ស៊ីថា)
const AI_CONSULTATION_CATEGORIES = [
  {
    id: "tough_medical",
    label: "🩺 រោគស្ត្រីស្មុគស្មាញ (មេរៀន ៦-១២)",
    desc: "ដុំសាច់/គីស, ស្បូនលូន/លាន់, សិរមាន់, បំបៅដោះ",
    scenarios: [
      {
        title: "🏥 មានដុំសាច់ស្បូន / គីសអូវែ (មេរៀន ៦)",
        prompt: "ភ្ញៀវប្រាប់ថាគាត់មានដុំសាច់ក្នុងស្បូន ឬដុំគីសអូវែ ហើយមានធ្លាក់ស និងរដូវមិនទៀង គាត់ខ្លាចញ៉ាំ Emmi ទៅប៉ះពាល់ដុំគីស តើត្រូវពន្យល់គាត់តាមមេរៀនទី ៦ យ៉ាងម៉េច?",
      },
      {
        title: "💨 ស្បូនលូន / ស្បូនលាន់ខ្យល់ (មេរៀន ៩)",
        prompt: "ភ្ញៀវក្រោយសម្រាលកូន មានបញ្ហាស្បូនលូនធ្លាក់ទាប ធ្ងន់ថ្ងាស និងមានខ្យល់ចេញពីទ្វារមាស (ស្បូនលាន់) ពេលរួមដំណេក គាត់ខ្មាសស្វាមីខ្លាំង តើត្រូវណែនាំ Emmi រួមជាមួយលំហាត់ប្រាណ Kegel យ៉ាងម៉េច?",
      },
      {
        title: "🩸 សាច់ដុះច្រមុះស្បូន / ធ្លាក់ឈាមក្រោយរួមភេទ (មេរៀន ៧)",
        prompt: "ភ្ញៀវប្រាប់ថាគាត់ឧស្សាហ៍ធ្លាក់ឈាមតិចៗក្រោយពេលរួមដំណេក ឬធ្លាប់ពិនិត្យឃើញសាច់ដុះច្រមុះស្បូន (Cervical Polyps) តើត្រូវប្រឹក្សា និងណែនាំគាត់យ៉ាងម៉េច?",
      },
      {
        title: "🔥 រលាកអាងត្រគាក PID / ឈឺពោះក្រោម (មេរៀន ១០)",
        prompt: "ភ្ញៀវមានអាការៈឈឺចាប់អាងត្រគាក និងពោះផ្នែកខាងក្រោមរ៉ាំរ៉ៃ ធ្លាក់សធុំក្លិន និងឈឺពេលរួមដំណេក (សង្ស័យរលាកអាងត្រគាក PID) តើត្រូវណែនាំគាត់បែបណា?",
      },
      {
        title: "⚠️ ដុះសាច់សិរមាន់ HPV (មេរៀន ១២)",
        prompt: "ភ្ញៀវឆាតមកប្រាប់ថាគាត់មានដុះសាច់តូចៗដូចផ្កាស្ពៃ ឬសិរមាន់នៅតំបន់ពិសេស (ជំងឺសិរមាន់ HPV) តើអ្នកលក់ត្រូវឆ្លើយលើកទឹកចិត្ត រក្សាការសម្ងាត់ និងណែនាំគាត់ទៅជួបគ្រូពេទ្យយ៉ាងម៉េចតាមមេរៀនទី ១២?",
      },
      {
        title: "🤱 កំពុងបំបៅដោះកូន / ទឹកនោមផ្អែម",
        prompt: "ភ្ញៀវកំពុងបំបៅដោះកូន (ឬមានជំងឺប្រចាំកាយដូចជាទឹកនោមផ្អែម/លើសឈាម) មានបញ្ហាធ្លាក់ស និងស្បូនខ្សោយ គាត់សួរថាញ៉ាំ Emmi បានអត់?",
      },
    ],
  },
  {
    id: "core_symptoms",
    label: "🌸 វិនិច្ឆ័យធ្លាក់ស & អ័រម៉ូន (មេរៀន ១-៥, ៨, ១៣-១៥)",
    desc: "ផ្សិត vs បាក់តេរី, រដូវ, ស្បែកជាំ, វ័យអស់រដូវ",
    scenarios: [
      {
        title: "🔍 សំណួរវិនិច្ឆ័យរោគទាំង ៥ (មេរៀន ៤)",
        prompt: "ភ្ញៀវឆាតមកសួរកំបុតៗថា 'អូន ធ្លាក់សញ៉ាំអីជា?' តើត្រូវប្រើប្រយោគបើកឆាក និងសំណួរវិនិច្ឆ័យរោគស្ត្រីទាំង ៥ ក្នុងមេរៀនទី ៤ ដើម្បីសួរគាត់បែបណាឱ្យគាត់មើលឃើញថាយើងជាអ្នកជំនាញ?",
      },
      {
        title: "🧀 ធ្លាក់សកកដូចម្សៅ/ទឹកដោះគោជូរ & រមាស់ខ្លាំង (មេរៀន ៥)",
        prompt: "ភ្ញៀវប្រាប់ថាគាត់ធ្លាក់សពណ៌សខាប់កកដូចម្សៅ ឬទឹកដោះគោជូរ រមាស់ខ្លាំង និងផ្សារក្រហម (មេរោគផ្សិត Candida) ក្រោយគាត់ឧស្សាហ៍លេបថ្នាំផ្សះ និងចូលចិត្តញ៉ាំផ្អែម តើត្រូវពន្យល់គាត់តាមមេរៀនទី ៥ យ៉ាងម៉េច?",
      },
      {
        title: "🐟 ធ្លាក់សប្រផេះក្លិនឆ្អាប vs បៃតងមានពពុះ (មេរៀន ១&៣)",
        prompt: "ភ្ញៀវប្រាប់ថាគាត់ធ្លាក់សមានក្លិនឆ្អាបខ្លាំងជាពិសេសក្រោយរួមដំណេក (ឬពណ៌លឿងបៃតង) គាត់អៀនស្វាមីខ្លាំង តើត្រូវពន្យល់ពីបាក់តេរីអាក្រក់ និងផលប៉ះពាល់ទាំង ៥ យ៉ាងដើម្បីបិទការលក់ Emmi យ៉ាងម៉េច?",
      },
      {
        title: "🩸 រដូវមិនទៀង / ឈាមខ្មៅកកដុំៗ (មេរៀន ៨&១៤)",
        prompt: "ភ្ញៀវមករដូវមិនទៀង មកតិចៗពណ៌ខ្មៅកកដុំៗ និងឈឺចុកពោះខ្លាំង តើត្រូវប្រើយុទ្ធសាស្ត្រ 'សង្កេត - ណែនាំ - បង្ហាញដំណោះស្រាយ' តាមមេរៀនទី ៨ និង ១៤ យ៉ាងដូចម្តេច?",
      },
      {
        title: "✨ មុខជាំ មុនអ័រម៉ូន៖ ស្បូនជាឫសគល់ ស្បែកជាស្លឹក (មេរៀន ១៣)",
        prompt: "ភ្ញៀវលាបឡេថ្លៃៗតែមុខនៅតែជាំ និងឡើងមុនអ័រម៉ូនមិនបាត់ តើត្រូវប្រើទស្សនៈ 'ស្បូនគឺជាឫសគល់ ចំណែកស្បែកគឺជាស្លឹក' ក្នុងមេរៀនទី ១៣ ដើម្បីពន្យល់គាត់ឱ្យទិញ Emmi យ៉ាងម៉េច?",
      },
      {
        title: "⏳ វ័យអស់រដូវ ៤៥-៥៥ឆ្នាំ & ដើមទ្រូងយារធ្លាក់ (មេរៀន ១១&១៥)",
        prompt: "ភ្ញៀវវ័យ ៤៥-៥៥ ឆ្នាំ មានបញ្ហាស្ងួតទ្វារមាស ក្តៅភាយៗ បែកញើសយប់ មួម៉ៅ និងដើមទ្រូងយារធ្លាក់ តើត្រូវណែនាំ 'មន្តស្នេហ៍ ៣៦០ ដឺក្រេ' របស់ Emmi តាមមេរៀនទី ១១ និង ១៥ យ៉ាងម៉េច?",
      },
    ],
  },
  {
    id: "objections",
    label: "🛡️ ភ្ញៀវរុញរា / ពិបាកបិទ",
    desc: "ភ្ញៀវមិនទុកចិត្ត ថាថ្លៃ ឬចាំគិតមើលសិន",
    scenarios: [
      {
        title: "😒 ប្រើថ្នាំសុល/ថ្នាំពេទ្យច្រើនហើយ តែលាប់មកវិញ",
        prompt: "ភ្ញៀវនិយាយថា៖ 'បងធ្លាប់ទិញថ្នាំសុល និងលេបថ្នាំផ្សះច្រើនដងហើយ ជាបានតែមួយភ្លែតក៏លាប់មកវិញ អស់លុយច្រើនណាស់ ខ្លាចទិញ Emmi ទៅដូចគ្នា' តើត្រូវពន្យល់ពីភាពខុសគ្នារវាងថ្នាំផ្សះ និងការបង្កើនបាក់តេរីល្អរបស់ Emmi យ៉ាងម៉េច?",
      },
      {
        title: "💰 ភ្ញៀវថា 'តម្លៃថ្លៃពេក' (មេរៀន ២៖ ផលប៉ះពាល់សេដ្ឋកិច្ច)",
        prompt: "ភ្ញៀវចាប់អារម្មណ៍ចង់បាន តែគាត់រុញរាថា៖ 'តម្លៃថ្លៃពេកអូន ចុះថ្លៃតិចបានអត់?' តើត្រូវពន្យល់ប្រៀបធៀបជាមួយផលប៉ះពាល់ទាំង ៥ (ពិសេសការទុកយូររហូតដល់រលាកអាងត្រគាកត្រូវចំណាយលុយវះកាត់ថ្លៃ) និងបិទការលក់យ៉ាងម៉េច?",
      },
      {
        title: "😨 ខ្លាចប៉ះពាល់ក្រលៀន / ថ្លើម",
        prompt: "ភ្ញៀវខ្លាចថា៖ 'ញ៉ាំអាហារបំប៉នហ្នឹងយូរទៅ ខ្លាចខូចក្រលៀន ឬប៉ះពាល់ថ្លើមណាស់' តើត្រូវពន្យល់តាមក្បួនសុខភាពយ៉ាងម៉េចឱ្យគាត់អស់បារម្ភ?",
      },
      {
        title: "🤔 'ចាំគិតមើលសិន / ចាំសួរស្វាមីសិន'",
        prompt: "ភ្ញៀវសួរនាំចប់សព្វគ្រប់ហើយ តែគាត់ឆ្លើយថា៖ 'ចាំបងគិតមើលសិន / ចាំសួរគ្រួសារសិន' តើត្រូវឆ្លើយតបបែបណាដោយទន់ភ្លន់តែចាក់ចំបេះដូង (ផលប៉ះពាល់ជីវិតប្តីប្រពន្ធ និងសុខភាព) ឱ្យគាត់សម្រេចចិត្តកម្ម៉ង់ថ្ងៃនេះ?",
      },
      {
        title: "📦 ចង់ទិញតែ ១ ប្រអប់ឱ្យជាដាច់",
        prompt: "ភ្ញៀវមានបញ្ហារ៉ាំរ៉ៃយូរឆ្នាំ តែគាត់សួរថា៖ 'បងយកតែ ១ ប្រអប់សិនបានអត់? ញ៉ាំ ១ ប្រអប់ហ្នឹងដឹងតែជាដាច់មែនអត់?' តើត្រូវពន្យល់យ៉ាងម៉េចឱ្យគាត់យល់ពីដំណាក់កាលសម្អាត និងប៉ូវស្បូន?",
      },
    ],
  },
  {
    id: "followup_reactions",
    label: "🥗 ថែទាំ ៣៦០° & ភ្ញៀវកំពុងប្រើ (មេរៀន ១៦-១៧)",
    desc: "អាហារគួរតម/គួរញ៉ាំ និងអាការៈពេលប្រើ",
    scenarios: [
      {
        title: "🚫 បញ្ជីអាហារគួរតម ៥ មុខ & គួរញ៉ាំ ៥ មុខ (មេរៀន ១៦-១៧)",
        prompt: "ភ្ញៀវទើបទិញ Emmi ហើយសួរថា៖ 'អូន ពេលកំពុងញ៉ាំ Emmi តើបងត្រូវតមអាហារអ្វីខ្លះ និងគួរញ៉ាំអាហារអ្វីខ្លះដើម្បីឱ្យឆាប់ជាដាច់?' សូមរៀបចំសារណែនាំតាមមេរៀនទី ១៦ និង ១៧។",
      },
      {
        title: "⚠️ ប្រើ ៣-៥ថ្ងៃ ធ្លាក់សចេញច្រើនជាងមុន",
        prompt: "ភ្ញៀវទិញ Emmi យកទៅញ៉ាំបាន ៤ ថ្ងៃ គាត់ឆាតមកទាំងភ័យថា៖ 'អូន! ម៉េចបងញ៉ាំទៅឃើញធ្លាក់សចេញមកច្រើនជាងមុនអញ្ចឹង? តិចអត់ត្រូវថ្នាំទៅ?' តើត្រូវពន្យល់ពីដំណាក់កាលលាងសម្អាតស្បូនយ៉ាងម៉េចឱ្យគាត់សប្បាយចិត្តប្រើបន្ត?",
      },
      {
        title: "🩸 ញ៉ាំហើយរដូវមកលឿន ឬធ្លាក់ឈាមកកខ្មៅ",
        prompt: "ភ្ញៀវញ៉ាំ Emmi ហើយប្រាប់ថា ខែនេះរដូវគាត់មកលឿនជាងមុន ហើយមានធ្លាក់ឈាមដុំៗខ្មៅកក តើត្រូវពន្យល់ពីការបញ្ចេញឈាមចាស់កកស្ទះក្នុងស្បូនយ៉ាងដូចម្តេច?",
      },
      {
        title: "📦 ញ៉ាំជិតអស់ ១ ប្រអប់ មិនទាន់បាត់ដាច់",
        prompt: "ភ្ញៀវប្រាប់ថា៖ 'បងញ៉ាំជិតអស់ ១ ប្រអប់ហើយ គ្រាន់តែធូរជាងមុនតិច តែអត់ទាន់បាត់ដាច់ទេ (ព្រោះគាត់នៅញ៉ាំផ្អែម និងប្រហុកជ្រក់)' តើត្រូវពន្យល់លើកទឹកចិត្ត ណែនាំឱ្យតមអាហារតាមមេរៀនទី ១៦ និងបន្តឈុតទី ២ យ៉ាងម៉េច?",
      },
      {
        title: "💧 នោមញឹក នោមទាស់ & ចុកចង្កេះ (Kidney Pro)",
        prompt: "ភ្ញៀវមានបញ្ហានោមញឹកពេលយប់ នោមទាស់ និងចុករោយចង្កេះ តើត្រូវណែនាំ Kidney Pro និង Pro D.O យ៉ាងដូចម្តេច?",
      },
    ],
  },
];

interface QuizQuestion {
  id: string;
  lesson: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const SELLER_QUIZ_BANK: QuizQuestion[] = [
  {
    id: "q1",
    lesson: "មេរៀនទី ១៖ ធ្លាក់សធម្មតា vs ធ្លាក់សរោគ",
    question: "តើការធ្លាក់សបែបណាដែលចាត់ទុកថាជា «ធ្លាក់សធម្មតា» មិនមែនជារោគស្ត្រី?",
    options: [
      "ធ្លាក់សពណ៌សថ្លា ឬសខាប់តិចតួច គ្មានក្លិន គ្មានរមាស់ (ពាក់កណ្តាលវដ្តរដូវ)",
      "ធ្លាក់សពណ៌សខាប់កកដូចម្សៅ ឬទឹកដោះគោជូរ និងរមាស់ខ្លាំង",
      "ធ្លាក់សពណ៌ប្រផេះ និងមានក្លិនឆ្អាបខ្លាំងក្រោយរួមដំណេក",
      "ធ្លាក់សពណ៌បៃតង ឬលឿង និងមានពពុះ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៖ ធ្លាក់សធម្មតាមានពណ៌សថ្លា ឬសខាប់តិចតួច គ្មានក្លិន គ្មានរមាស់ កើតឡើងតាមវដ្តអ័រម៉ូន (ពេលមេជីវិតញីធ្លាក់ ឬជិតមករដូវ)។",
  },
  {
    id: "q2",
    lesson: "មេរៀនទី ១ & ៥៖ មេរោគផ្សិត (Candida albicans)",
    question: "ប្រសិនបើភ្ញៀវប្រាប់ថា ធ្លាក់សពណ៌សខាប់កកដូចម្សៅ ឬដូចទឹកដោះគោជូរ ហើយរមាស់ខ្លាំងចង់តែអេស តើបណ្តាលមកពីមេរោគអ្វី?",
    options: [
      "បាក់តេរីអាក្រក់ (Bacterial Vaginosis)",
      "មេរោគផ្សិតក្នុងទ្វារមាស (Candida albicans)",
      "មេរោគឆ្លងតាមការរួមភេទ (Trichomoniasis)",
      "សាច់ដុះច្រមុះស្បូន (Cervical Polyps)",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១ និងទី ៥៖ ធ្លាក់សខាប់កកដូចម្សៅ ឬទឹកដោះគោជូរ រមាស់ខ្លាំង និងផ្សារក្រហម គឺបណ្តាលមកពីមេរោគផ្សិត (Candida albicans)។",
  },
  {
    id: "q3",
    lesson: "មេរៀនទី ១៖ បាក់តេរីអាក្រក់ (Bacterial Vaginosis)",
    question: "ភ្ញៀវធ្លាក់សពណ៌ប្រផេះ និងមានក្លិនឆ្អាបខ្លាំង (ជាពិសេសក្រោយពេលរួមដំណេក) តើជាសញ្ញានៃបញ្ហាអ្វី?",
    options: [
      "ធ្លាក់សធម្មតាតាមវដ្តរដូវ",
      "មេរោគផ្សិត Candida",
      "បាក់តេរីអាក្រក់ក្នុងទ្វារមាស (បាត់បង់តុល្យភាពបាក់តេរីល្អ)",
      "ដុំគីសអូវែ",
    ],
    correctIndex: 2,
    explanation: "តាមមេរៀនទី ១៖ ធ្លាក់សពណ៌ប្រផេះ និងមានក្លិនឆ្អាបខ្លាំងក្រោយរួមដំណេក គឺបណ្តាលមកពីបាក់តេរីអាក្រក់ (Bacterial Vaginosis) ដោយសារបាត់បង់បាក់តេរីល្អ។",
  },
  {
    id: "q4",
    lesson: "មេរៀនទី ១៖ មេរោគ Trichomoniasis",
    question: "តើការធ្លាក់សពណ៌បៃតង ឬលឿង លាយពពុះ និងមានក្លិនស្អុយខុសធម្មតា បណ្តាលមកពីអ្វី?",
    options: [
      "មេរោគឆ្លងតាមការរួមភេទ (Trichomoniasis)",
      "ការញ៉ាំទឹកស្អាតច្រើនពេក",
      "ការហាត់ប្រាណ Kegel",
      "ការធ្លាក់មេជីវិតញីពាក់កណ្តាលខែ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៖ ធ្លាក់សពណ៌បៃតង ឬលឿង និងមានពពុះ ក្លិនស្អុយខុសធម្មតា គឺជាសញ្ញានៃមេរោគឆ្លងតាមការរួមភេទ (Trichomoniasis)។",
  },
  {
    id: "q5",
    lesson: "មេរៀនទី ២៖ ផលប៉ះពាល់ទាំង ៥ ផ្នែក",
    question: "តាមមេរៀនទី ២ តើជំងឺរោគស្ត្រីប៉ះពាល់ដល់អតិថិជនលើផ្នែកសំខាន់ៗចំនួនប៉ុន្មាន?",
    options: [
      "២ ផ្នែក (រាងកាយ និងថវិកា)",
      "៣ ផ្នែក (រាងកាយ ផ្លូវចិត្ត និងសម្រស់)",
      "៥ ផ្នែក (រាងកាយ, ផ្លូវចិត្ត, ជីវិតប្តីប្រពន្ធ, សម្រស់, និងសេដ្ឋកិច្ច)",
      "១ ផ្នែកគត់ គឺការឈឺពោះពេលមករដូវ",
    ],
    correctIndex: 2,
    explanation: "តាមមេរៀនទី ២៖ រោគស្ត្រីប៉ះពាល់ ៥ ផ្នែកគឺ៖ ១) រាងកាយ ២) ផ្លូវចិត្ត ៣) ជីវិតប្តីប្រពន្ធ/សុភមង្គលគ្រួសារ ៤) សម្រស់ (ដើមទ្រូងយារ មុខជាំ មុន) និង ៥) សេដ្ឋកិច្ច (ទុកយូរអស់លុយវះកាត់ថ្លៃ)។",
  },
  {
    id: "q6",
    lesson: "មេរៀនទី ៣ & ៥៖ មូលហេតុលេបថ្នាំផ្សះយូរ",
    question: "ហេតុអ្វីបានជាការប្រើថ្នាំផ្សះ (Antibiotics) រយៈពេលយូរ ធ្វើឱ្យស្ត្រីងាយឆ្លងមេរោគផ្សិត និងធ្លាក់ស?",
    options: [
      "ព្រោះថ្នាំផ្សះធ្វើឱ្យឡើងទម្ងន់ភ្លាមៗ",
      "ព្រោះថ្នាំផ្សះទៅសម្លាប់បាក់តេរីល្អ (Lactobacillus) ដែលជាទាហានការពារទ្វារមាស",
      "ព្រោះថ្នាំផ្សះធ្វើឱ្យឈាមរដូវមកច្រើនជ្រុល",
      "ព្រោះថ្នាំផ្សះធ្វើឱ្យស្បូនលូនធ្លាក់ទាប",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៣ និងទី ៥៖ ការប្រើថ្នាំផ្សះយូរ នឹងទៅសម្លាប់បាក់តេរីល្អ (Lactobacillus) ដែលការពារទ្វារមាស ធ្វើឱ្យមេរោគផ្សិតរីកលូតលាស់យ៉ាងឆាប់រហ័ស។",
  },
  {
    id: "q7",
    lesson: "មេរៀនទី ៣ & ៥៖ ការជ្រើសរើសខោក្នុង និងអនាម័យ",
    question: "តើអ្នកលក់គួរណែនាំអតិថិជនឱ្យជ្រើសរើសស្លៀកខោក្នុងប្រភេទណា ដើម្បីការពារកុំឱ្យហប់សើម និងកើតផ្សិត?",
    options: [
      "ខោក្នុងសាច់នីឡុងរឹបតឹងណែន",
      "ខោក្នុងសាច់កប្បាស (Cotton) ដែលស្រឡះ និងចេញចូលខ្យល់បានល្អ",
      "ខោក្នុងសាច់សូត្រសិប្បនិម្មិតក្រាស់ៗ",
      "ប្រើទឹកអប់បាញ់សម្អាត និងសាប៊ូដុសខ្លួនជាតិកាត់ខ្លាំង",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៣ និងទី ៥៖ ត្រូវណែនាំឱ្យស្លៀកខោក្នុងសាច់កប្បាស (Cotton) កុំស្លៀកខោតឹងហប់ និងចៀសវាងសាប៊ូដុសខ្លួនជាតិកាត់ខ្លាំងដែលបំផ្លាញកម្រិត pH។",
  },
  {
    id: "q8",
    lesson: "មេរៀនទី ៤៖ សំណួរវិនិច្ឆ័យរោគទាំង ៥",
    question: "នៅពេលភ្ញៀវមានបញ្ហាធ្លាក់ស តើសំណួរវិនិច្ឆ័យរោគទាំង ៥ ក្នុងមេរៀនទី ៤ ផ្តោតលើអ្វីខ្លះ?",
    options: [
      "អាយុ, កម្ពស់, ទម្ងន់, ឈ្មោះប្តី, និងប្រាក់ខែ",
      "ពណ៌/សភាព, ក្លិន/រមាស់, ទម្លាប់អនាម័យ, របបអាហារ, និងវដ្តរដូវ/អ័រម៉ូន",
      "ម៉ាកឡេលាបមុខ, ម៉ោងចូលគេង, និងចំនួនកូន",
      "ប្រភេទក្រុមឈាម និងសម្ពាធឈាម",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៤៖ សំណួរទាំង ៥ គឺ៖ ១) ពណ៌ និងសភាព ២) ក្លិន និងការរមាស់ ៣) ទម្លាប់អនាម័យ ៤) របបអាហារ និង ៥) វដ្តរដូវ និងអ័រម៉ូន។",
  },
  {
    id: "q9",
    lesson: "មេរៀនទី ៦៖ ដុំសាច់ស្បូន vs ដុំគីសអូវែ",
    question: "ប្រសិនបើអតិថិជនមានដុំសាច់ស្បូនធំខ្លាំង ឬមានការឈឺចាប់ខ្លាំងភ្លាមៗ តើអ្នកលក់ត្រូវណែនាំយ៉ាងដូចម្តេចតាមក្រមសីលធម៌វិជ្ជាជីវៈ?",
    options: [
      "ឱ្យគាត់ញ៉ាំ Emmi ម្ដង ១០ គ្រាប់ភ្លាមៗដោយមិនបាច់ទៅពេទ្យ",
      "ណែនាំឱ្យគាត់ទៅពិនិត្យអេកូ (Ultrasound) នៅមន្ទីរពេទ្យជាបន្ទាន់ដើម្បីដឹងទំហំជាក់លាក់",
      "ប្រាប់គាត់ឱ្យផឹកគ្រឿងស្រវឹងដើម្បីបំបាត់ការឈឺចាប់",
      "ប្រាប់គាត់ថាមិនអីទេ មិនបាច់ពិនិត្យអ្វីទាំងអស់",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៦៖ សម្រាប់ដុំតូចៗ Emmi ជួយសម្រួលអ័រម៉ូន និងរោគសញ្ញា តែបើដុំធំខ្លាំង ឬឈឺខ្លាំងភ្លាមៗ ត្រូវណែនាំឱ្យទៅពិនិត្យអេកូ (Ultrasound) នៅមន្ទីរពេទ្យជាបន្ទាន់។",
  },
  {
    id: "q10",
    lesson: "មេរៀនទី ៧៖ ការដុះសាច់ច្រមុះស្បូន (Cervical Polyps)",
    question: "តើរោគសញ្ញាធ្លាក់ឈាមមិនធម្មតាបន្ទាប់ពីរួមដំណេក ឬនៅចន្លោះវដ្តរដូវ គឺជាសញ្ញាព្រមានចម្បងនៃជំងឺអ្វីក្នុងមេរៀនទី ៧?",
    options: [
      "ការដុះសាច់ច្រមុះស្បូន (Cervical Polyps) និងបញ្ហាមាត់ស្បូន",
      "ការឡើងទម្ងន់ធម្មតា",
      "ការគេងមិនគ្រប់គ្រាន់",
      "ការផឹកទឹកច្រើនពេក",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៧៖ ការធ្លាក់ឈាមក្រោយរួមដំណេក ឬចន្លោះវដ្តរដូវ គឺជាសញ្ញាព្រមាននៃសាច់ដុះច្រមុះស្បូន (Cervical Polyps)។ Emmi ជួយកាត់បន្ថយការរលាករ៉ាំរ៉ៃ និងគួរណែនាំឱ្យពិនិត្យ Pap Smear។",
  },
  {
    id: "q11",
    lesson: "មេរៀនទី ៨៖ ឈាមរដូវពណ៌ខ្មៅកកដុំៗ",
    question: "តាមមេរៀនទី ៨ នៅពេលអតិថិជនមករដូវមានឈាមពណ៌ខ្មៅ ឬដុំៗ និងមកតិចខ្លាំង តើវាបង្ហាញពីបញ្ហាអ្វីនៅក្នុងស្បូន?",
    options: [
      "ស្បូនមានសុខភាពល្អឥតខ្ចោះ",
      "ស្បូនត្រជាក់ ខ្វះឈាម និងមានការកកស្ទះឈាមចាស់ៗនៅក្នុងស្បូន",
      "មានជាតិវីតាមីន C ច្រើនពេកក្នុងរាងកាយ",
      "សាច់ដុំអាងត្រគាករឹងមាំពេក",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៨៖ ឈាមរដូវមកតិច ពណ៌ខ្មៅកកដុំៗ បង្ហាញថាស្បូនត្រជាក់ និងមានឈាមចាស់ៗកកស្ទះ។ Emmi ជួយបញ្ចេញឈាមកកស្ទះ និងធ្វើឱ្យស្បូនស្អាត និងមានកម្ដៅ។",
  },
  {
    id: "q12",
    lesson: "មេរៀនទី ៩៖ ស្បូនលូន & ស្បូនលាន់ (ខ្យល់ស្បូន)",
    question: "សម្រាប់ភ្ញៀវមានបញ្ហាស្បូនលូន ឬស្បូនលាន់ (ខ្យល់ចេញតាមទ្វារមាស) ក្រៅពីញ៉ាំ Emmi តើអ្នកលក់ត្រូវបង្រៀនលំហាត់ប្រាណអ្វីបន្ថែម?",
    options: [
      "លើកដុំដែកធ្ងន់ៗរាល់ថ្ងៃ",
      "លំហាត់ប្រាណ Kegel (ខ្ជឹបសាច់ដុំអាងត្រគាក ៥-១០ វិនាទី ធ្វើ ១០-២០ ដង/ថ្ងៃ)",
      "រត់ប្រណាំងចម្ងាយឆ្ងាយ",
      "អង្គុយចោងហោងយូរៗ",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ៩៖ ត្រូវណែនាំឱ្យប្រើ Emmi រួមជាមួយលំហាត់ប្រាណ Kegel (ខ្ជឹបសាច់ដុំអាងត្រគាកដូចខ្ជឹបបង្អង់នោម ៥-១០ វិនាទី ១០-២០ ដង/ថ្ងៃ) និងកុំលើករបស់ធ្ងន់។",
  },
  {
    id: "q13",
    lesson: "មេរៀនទី ១០៖ ជំងឺរលាកអាងត្រគាក (PID)",
    question: "នៅពេលអតិថិជនកំពុងព្យាបាលជំងឺរលាកអាងត្រគាក (PID) តើអ្នកលក់គួរណែនាំអតិថិជនឱ្យផ្អាកអ្វីមួយរយៈ?",
    options: [
      "ផ្អាកការផឹកទឹកស្អាត",
      "ផ្អាកការរួមដំណេកមួយរយៈក្នុងកំឡុងពេលកំពុងព្យាបាល និងរក្សាអនាម័យខ្ជាប់ខ្ជួន",
      "ផ្អាកការញ៉ាំបន្លែបៃតង",
      "ផ្អាកការគេងពេលយប់",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១០៖ ក្នុងកំឡុងពេលព្យាបាលរលាកអាងត្រគាក ត្រូវណែនាំឱ្យផ្អាកការរួមដំណេកមួយរយៈ និងប្រើ Emmi ជួយលាងជម្រះបាក់តេរីអាក្រក់ពីខាងក្នុង។",
  },
  {
    id: "q14",
    lesson: "មេរៀនទី ១១ & ១៥៖ ស្ត្រីវ័យអស់រដូវ (៤៥-៥៥ ឆ្នាំ)",
    question: "តើរោគសញ្ញាក្តៅភាយៗ (Hot Flashes) បែកញើសយប់ ស្ងួតទ្វារមាស និងមួម៉ៅនៅវ័យ ៤៥-៥៥ ឆ្នាំ បណ្តាលមកពីការធ្លាក់ចុះអ័រម៉ូនអ្វី?",
    options: [
      "អ័រម៉ូនអេស្ត្រូសែន (Estrogen)",
      "អ័រម៉ូនអាំងស៊ុយលីន (Insulin)",
      "អ័រម៉ូនអាដ្រេណាលីន (Adrenaline)",
      "វីតាមីន D",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១១ និង ១៥៖ បណ្តាលមកពីការធ្លាក់ចុះអ័រម៉ូន Estrogen។ Emmi ជួយបំពេញតុល្យភាពអ័រម៉ូន ស្តារសំណើម និងផ្តល់មន្តស្នេហ៍ ៣៦០ ដឺក្រេ (ពង្រឹងដើមទ្រូង និងស្បែកភ្លឺថ្លា)។",
  },
  {
    id: "q15",
    lesson: "មេរៀនទី ១២៖ ជំងឺសិរមាន់ (HPV / Genital Warts)",
    question: "ប្រសិនបើអតិថិជនឆាតមកប្រាប់ថាមានដុះសាច់តូចៗដូចផ្កាស្ពៃ ឬសិរមាន់ (HPV) តើអ្នកលក់ត្រូវធ្វើដូចម្តេចតាមមេរៀនទី ១២?",
    options: [
      "សន្យាថាញ៉ាំតែ ១ ប្រអប់នឹងជ្រុះសាច់សិរមាន់អស់ភ្លាម",
      "ផ្តល់កម្លាំងចិត្ត រក្សាការសម្ងាត់ និងណែនាំឱ្យទៅជួបគ្រូពេទ្យសើស្បែក ឬរោគស្ត្រីជាបន្ទាន់ (ព្រោះលើសពីសមត្ថភាពអាហារបំប៉នទូទៅ)",
      "ឱ្យគាត់យកសាប៊ូដុសខ្លួនមកដុសឱ្យខ្លាំងៗ",
      "បដិសេធមិនឆ្លើយតបសាររបស់គាត់",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១២៖ ជំងឺសិរមាន់ (HPV) គឺលើសពីសមត្ថភាពផលិតផលបំប៉នទូទៅ ដូច្នេះត្រូវផ្តល់កម្លាំងចិត្ត រក្សាការសម្ងាត់ និងណែនាំឱ្យគាត់ទៅជួបគ្រូពេទ្យជំនាញជាបន្ទាន់។",
  },
  {
    id: "q16",
    lesson: "មេរៀនទី ១៣៖ សុខភាពស្បែកពីខាងក្នុង",
    question: "តើពាក្យស្លោកមាសក្នុងមេរៀនទី ១៣ ដែលពន្យល់ភ្ញៀវមានបញ្ហាមុខជាំ និងមុនអ័រម៉ូន គឺជាអ្វី?",
    options: [
      "«ឡេថ្លៃគឺជាឫសគល់ ស្បូនគឺជាស្លឹក»",
      "«ស្បូនគឺជាឫសគល់ ចំណែកស្បែកគឺជាស្លឹក» (បើឫសគល់ស្អាត ទើបស្លឹកស្រស់បំព្រង)",
      "«លាបឡេឱ្យក្រាស់ បាត់ជាំភ្លាមៗ»",
      "«កុំញ៉ាំទឹក ដើម្បីឱ្យស្បែកភ្លឺថ្លា»",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១៣៖ «ស្បូនគឺជាឫសគល់ ចំណែកស្បែកគឺជាស្លឹក»។ ស្បូនស្អាត = គ្មានជាតិពុលកកស្ទះ = គ្មានមុន និងជាំ។",
  },
  {
    id: "q17",
    lesson: "មេរៀនទី ១៤៖ យុទ្ធសាស្ត្រលក់ ៣ ជំហាន",
    question: "តើគោលការណ៍លក់ ៣ ជំហានសម្រាប់អ្នកជំនាញ Emmi ក្នុងមេរៀនទី ១៤ មានអ្វីខ្លះ?",
    options: [
      "«បង្ខំ - បញ្ចុះតម្លៃ - ផ្ញើទំនិញ»",
      "«សង្កេត - ណែនាំ - បង្ហាញដំណោះស្រាយ»",
      "«សួរតម្លៃ - សុំលេខទូរសព្ទ - បិទឆាត»",
      "«ផ្ញើរូបភាព - រង់ចាំភ្ញៀវឆ្លើយ - ឈប់តាមដាន»",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១៤៖ គោលការណ៍លក់របស់អ្នកជំនាញ Emmi គឺ «សង្កេត (សួរពីអាការៈ) - ណែនាំ (ពន្យល់ពីមូលហេតុ) - បង្ហាញដំណោះស្រាយ (ណែនាំ Emmi)»។",
  },
  {
    id: "q18",
    lesson: "មេរៀនទី ១៦៖ អាហារគួរចៀសវាងទាំង ៥ ក្រុម",
    question: "ហេតុអ្វីបានជាអ្នកមានបញ្ហាធ្លាក់ស និងរមាស់ ត្រូវតមអាហារផ្អែម (ជាតិស្ករខ្ពស់) និងអាហារផ្អាប់ (ប្រហុក ផ្អក ជ្រក់)?",
    options: [
      "ព្រោះជាតិស្ករជាអាហារបំប៉នមេរោគផ្សិតឱ្យរីកលូតលាស់លឿន ឯអាហារផ្អាប់ធ្វើឱ្យធ្លាក់សកាន់តែធុំក្លិនឆ្អាបខ្លាំង",
      "ព្រោះអាហារផ្អែមធ្វើឱ្យសក់ជ្រុះភ្លាមៗ",
      "ព្រោះប្រហុកធ្វើឱ្យរដូវមកលឿនជាងមុន ១០ ថ្ងៃ",
      "ព្រោះវាធ្វើឱ្យទឹកប្រែពណ៌",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៦៖ ជាតិស្ករគឺជាអាហារដែលមេរោគផ្សិតចូលចិត្តបំផុត ចំណែកអាហារផ្អាប់ (ប្រហុក ផ្អក ជ្រក់) ធ្វើឱ្យបាត់តុល្យភាពបាក់តេរី និងបង្កក្លិនឆ្អាបខ្លាំង។",
  },
  {
    id: "q19",
    lesson: "មេរៀនទី ១៧៖ អាហារគួរទទួលទានទាំង ៥ ក្រុម",
    question: "តើអាហារមួយណាខាងក្រោមនេះ ដែលសម្បូរទៅដោយបាក់តេរីល្អ (Probiotics / Lactobacillus) ជួយរក្សាកម្រិត pH ក្នុងទ្វារមាស?",
    options: [
      "ទឹកក្រូចកំប៉ុង និងតែទឹកដោះគោផ្អែម",
      "យ៉ាអួរ ឬទឹកដោះគោជូរដែលគ្មានជាតិស្ករ (Plain Yogurt)",
      "នំប៉័ងស និងមីកញ្ចប់",
      "គ្រឿងសមុទ្រត្រាំ និងជ្រក់",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១៧៖ យ៉ាអួរ ឬទឹកដោះគោជូរគ្មានស្ករ សម្បូរទៅដោយ Probiotics (Lactobacillus) ដែលជួយកម្ចាត់មេរោគផ្សិត និងរក្សាតុល្យភាព pH។",
  },
  {
    id: "q20",
    lesson: "មេរៀនទី ១៧៖ វីតាមីន E, Zinc និងទឹកស្អាត",
    question: "តាមមេរៀនទី ១៧ តើអតិថិជនគួរទទួលទានទឹកស្អាតប៉ុន្មានលីត្រក្នុងមួយថ្ងៃ ដើម្បីជួយបណ្តេញជាតិពុល និងរក្សាសំណើមទ្វារមាស?",
    options: [
      "កន្លះលីត្រក្នុងមួយថ្ងៃ",
      "២ ទៅ ៣ លីត្រក្នុងមួយថ្ងៃ",
      "១០ លីត្រក្នុងមួយថ្ងៃ",
      "ផឹកតែពេលណាឃ្លានបាយប៉ុណ្ណោះ",
    ],
    correctIndex: 1,
    explanation: "តាមមេរៀនទី ១៧៖ ការផឹកទឹកស្អាត ២-៣ លីត្រក្នុងមួយថ្ងៃ ជួយលាងសម្អាតផ្លូវបង្ហូរនោម បណ្តេញជាតិពុល និងរក្សាសំណើមភ្នាសទ្វារមាស។",
  },
  {
    id: "q21",
    lesson: "ទស្សនៈស្នូលរបស់អគ្គនាយក វណ្ណ ស៊ីថា",
    question: "តើទស្សនៈស្នូលនៅទំព័រដំបូងនៃ «សៀវភៅ រោគស្ត្រី» បានកំណត់និយមន័យ «អ្នកលក់ឆ្នើម» ថាជាអ្នកលក់បែបណា?",
    options: [
      "អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលចេះបញ្ចុះតម្លៃថោកជាងគេ",
      "អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលមានជំនាញក្នុងវិស័យដែលខ្លួនលក់",
      "អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលឆ្លើយសារខ្លីបំផុត ១ ពាក្យ",
      "អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលមិនបាច់សួរនាំពីអាការៈភ្ញៀវ",
    ],
    correctIndex: 1,
    explanation: "ទស្សនៈស្នូលក្នុងសៀវភៅរោគស្ត្រី៖ «អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលមានជំនាញក្នុងវិស័យដែលខ្លួនលក់»។",
  },
  {
    id: "q22",
    lesson: "ការប្រឹក្សាពេលភ្ញៀវកំពុងប្រើ Emmi (៣-៥ ថ្ងៃដំបូង)",
    question: "ភ្ញៀវញ៉ាំ Emmi បាន ៤ ថ្ងៃ ស្រាប់តែធ្លាក់សចេញមកច្រើនជាងមុនបន្តិច តើអ្នកលក់ត្រូវពន្យល់គាត់យ៉ាងដូចម្តេច?",
    options: [
      "ប្រាប់គាត់ឱ្យបោះចោលភ្លាម ព្រោះអត់ត្រូវថ្នាំទេ",
      "អបអរសាទរគាត់ និងពន្យល់ថាជាសញ្ញាល្អនៃដំណាក់កាលលាងសម្អាត (បណ្តេញកាកសំណល់ និងមេរោគចាស់ៗដែលកកស្ទះក្នុងស្បូនចេញមកក្រៅ)",
      "ប្រាប់គាត់ឱ្យឈប់ផឹកទឹកស្អាត",
      "ប្រាប់គាត់ឱ្យទៅទិញថ្នាំផ្សះមកលេបបន្ថែម ៥ មុខ",
    ],
    correctIndex: 1,
    explanation: "ក្នុងរយៈពេល ៣-៧ ថ្ងៃដំបូង Emmi ចាប់ផ្តើមធ្វើការលាងសម្អាត និងរុញបញ្ចេញកាកសំណល់ធ្លាក់សចាស់ៗពីក្នុងស្បូន ដូច្នេះត្រូវលើកទឹកចិត្តឱ្យគាត់ញ៉ាំបន្តឱ្យទៀងទាត់ និងផឹកទឹកក្ដៅឧណ្ហៗ។",
  },
  {
    id: "q23",
    lesson: "មេរៀនទី ៦៖ រោគសញ្ញាដុំសាច់ស្បូន (Uterine Fibroids)",
    question: "ហេតុអ្វីបានជាស្ត្រីដែលមានដុំសាច់ក្នុងស្បូន តែងមានអាការៈនោមញឹកខុសធម្មតា និងណែនពោះផ្នែកខាងក្រោម?",
    options: [
      "ព្រោះដុំសាច់ក្នុងស្បូនរីកធំទៅសង្កត់លើប្លោកនោម",
      "ព្រោះគាត់ញ៉ាំបន្លែបៃតងច្រើនពេក",
      "ព្រោះគាត់ហាត់ប្រាណ Kegel រាល់ថ្ងៃ",
      "ព្រោះគាត់ផឹកទឹកតិចជាងកន្លះលីត្រ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៦៖ នៅពេលដុំសាច់ស្បូនរីកធំ វាទៅសង្កត់លើប្លោកនោមដែលនៅជិតនោះ ធ្វើឱ្យអតិថិជនមានអាការៈនោមញឹក និងតឹងណែនពោះក្រោម។",
  },
  {
    id: "q24",
    lesson: "មេរៀនទី ៦៖ រោគសញ្ញាដុំគីសអូវែ (Ovarian Cysts)",
    question: "តើរោគសញ្ញាឈឺអួលៗនៅចំហៀងពោះខាងក្រោម (ឆ្វេង ឬស្តាំ) រួមជាមួយអាការៈឆាប់ឆ្អែត និងរដូវមិនទៀង ជាសញ្ញាសម្គាល់នៃបញ្ហាអ្វី?",
    options: [
      "ដុំគីសអូវែ (Ovarian Cysts)",
      "ការធ្លាក់សធម្មតាពាក់កណ្តាលខែ",
      "ការលើសជាតិវីតាមីន C",
      "ការផឹកទឹកស្អាត ៣ លីត្រក្នុងមួយថ្ងៃ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៦៖ ដុំគីសអូវែ គឺជាថង់ទឹក ឬសាច់ដុះលើអូវែ ដែលបង្កឱ្យឈឺអួលចំហៀងពោះក្រោម (ឆ្វេងឬស្តាំ) ឆាប់ឆ្អែត និងមករដូវមិនទៀង។",
  },
  {
    id: "q25",
    lesson: "មេរៀនទី ៤៖ ប្រយោគបើកឆាករបស់អ្នកជំនាញ Emmi",
    question: "មុននឹងសួរសំណួរវិនិច្ឆ័យរោគទាំង ៥ ទៅកាន់អតិថិជន តើអ្នកលក់គួរប្រើប្រយោគបើកឆាកបែបណាដើម្បីកុំឱ្យអតិថិជនអៀនខ្មាស?",
    options: [
      "«ដើម្បីឱ្យខាងប្អូនអាចផ្តល់យោបល់ និងជួយដោះស្រាយបញ្ហាបានចំគោលដៅ ប្អូនសុំសួរសំណួរបន្តិចបន្តួចដើម្បីដឹងពីស្ថានភាពរបស់បងណា...»",
      "«តើបងចង់ទិញប៉ុន្មានប្រអប់ ឆ្លើយឱ្យលឿន?»",
      "«ហេតុអ្វីបងទុកជំងឺឱ្យធ្ងន់ធ្ងរម្ល៉េះ?»",
      "«បើអត់ទិញទេ កុំសួរច្រើនពេក!»",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៤៖ ការប្រើប្រយោគបើកឆាកដោយទន់ភ្លន់ ជួយឱ្យអតិថិជនមានអារម្មណ៍កក់ក្តៅ ទុកចិត្ត និងហ៊ានប្រាប់ពីអាការៈពិតប្រាកដ។",
  },
  {
    id: "q26",
    lesson: "មេរៀនទី ១៤៖ មូលហេតុស្ត្រេស និងការមករដូវមិនទៀង",
    question: "តាមមេរៀនទី ១៤ ហេតុអ្វីបានជាស្ត្រីដែលគិតច្រើន តានតឹងអារម្មណ៍ (Stress) ឬគេងមិនគ្រប់គ្រាន់ ធ្វើឱ្យរដូវមកមិនទៀង?",
    options: [
      "ព្រោះរាងកាយបញ្ចេញអ័រម៉ូនស្ត្រេស (Cortisol) ខ្ពស់ ទៅរំខានដល់អ័រម៉ូនបន្តពូជ និងការធ្លាក់មេជីវិតញី",
      "ព្រោះស្ត្រេសធ្វើឱ្យក្រពះរីកធំជាងមុន",
      "ព្រោះស្ត្រេសធ្វើឱ្យជាតិកាល់ស្យូមឡើងខ្ពស់",
      "ព្រោះស្ត្រេសជួយឱ្យឈាមរត់លឿនពេក",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៤៖ ភាពតានតឹង (Stress) ធ្វើឱ្យអ័រម៉ូន Cortisol កើនឡើង ទៅរំខានដំណើរការអ័រម៉ូនភេទ ធ្វើឱ្យរដូវរអាក់រអួល ឬបាត់រដូវ។",
  },
  {
    id: "q27",
    lesson: "មេរៀនទី ១៥៖ ឃ្លាលើកទឹកចិត្តស្ត្រីវ័យអស់រដូវ",
    question: "តើឃ្លាលើកទឹកចិត្តដ៏មានឥទ្ធិពលសម្រាប់អតិថិជនវ័យជិតអស់រដូវ ឬអស់រដូវ (៤៥-៥៥ ឆ្នាំ) ក្នុងមេរៀនទី ១៥ គឺជាអ្វី?",
    options: [
      "«ទោះបីជាអស់រដូវ តែបងនៅតែអាចស្អាត និងមានសុខភាពល្អបានជាមួយ Emmi»",
      "«អស់រដូវហើយ មិនបាច់ថែរក្សាសម្រស់ទៀតទេ»",
      "«វ័យអស់រដូវ មិនអាចប្រើអាហារបំប៉នបានឡើយ»",
      "«អស់រដូវហើយ ត្រូវតែឈឺចង្កេះជារៀងរហូត»",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៥៖ ឃ្លា «ទោះបីជាអស់រដូវ តែបងនៅតែអាចស្អាត និងមានសុខភាពល្អបានជាមួយ Emmi» ជួយផ្តល់កម្លាំងចិត្ត និងទំនុកចិត្តដល់ស្ត្រីវ័យ ៤៥-៥៥ ឆ្នាំ។",
  },
  {
    id: "q28",
    lesson: "មេរៀនទី ១៦៖ គ្រោះថ្នាក់នៃគ្រឿងស្រវឹងចំពោះរោគស្ត្រី",
    question: "តាមមេរៀនទី ១៦ តើការផឹកគ្រឿងស្រវឹង (ស្រាបៀរ ឬស្រា) ប៉ះពាល់ដល់ស្ត្រីដែលមានបញ្ហាធ្លាក់ស និងរលាកស្បូនយ៉ាងដូចម្តេច?",
    options: [
      "ធ្វើឱ្យឡើងកម្ដៅក្នុងខ្លួន ប្រព័ន្ធភាពស៊ាំចុះខ្សោយ និងបំផ្លាញបាក់តេរីល្អក្នុងទ្វារមាស",
      "ជួយសម្លាប់មេរោគផ្សិតក្នុងស្បូនឱ្យឆាប់ជា",
      "ជួយឱ្យបាក់តេរីល្អ Lactobacillus កើនឡើងទ្វេដង",
      "ជួយឱ្យរដូវមកទៀងទាត់ភ្លាមៗ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៦៖ គ្រឿងស្រវឹងធ្វើឱ្យឡើងកម្ដៅក្នុងខ្លួន បំផ្លាញបាក់តេរីល្អ និងធ្វើឱ្យអាការៈរលាក និងធ្លាក់សកាន់តែធ្ងន់ធ្ងរ។",
  },
  {
    id: "q29",
    lesson: "មេរៀនទី ១៧៖ អាហារកាត់បន្ថយការស្ងួតទ្វារមាស",
    question: "តាមមេរៀនទី ១៧ តើបន្លែស្លឹកបៃតងចាស់ គ្រាប់ធញ្ញជាតិ (ល្ពៅ អាល់ម៉ុន) និងផ្លែបឺរ សម្បូរទៅដោយជីវជាតិអ្វីដែលជួយកាត់បន្ថយការស្ងួតទ្វារមាស?",
    options: [
      "វីតាមីន E និងស័ង្កសី (Zinc) ដែលជួយសម្រួលអ័រម៉ូន និងបង្កើនសំណើម",
      "ជាតិស្ករខ្ពស់ និងម្សៅសម្រិត",
      "ជាតិកាហ្វេអ៊ីន និងជាតិអាល់កុល",
      "ជាតិប្រៃ និងអាហារផ្អាប់",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៧៖ បន្លែបៃតងចាស់ គ្រាប់ធញ្ញជាតិ និងផ្លែបឺរ សម្បូរវីតាមីន E និង Zinc ដែលជួយសម្រួលអ័រម៉ូន និងកាត់បន្ថយការស្ងួតទ្វារមាស។",
  },
  {
    id: "q30",
    lesson: "មេរៀនទី ១៧៖ អត្ថប្រយោជន៍នៃត្រីសមុទ្រ (Omega-3)",
    question: "ហេតុអ្វីបានជាក្នុងមេរៀនទី ១៧ ណែនាំឱ្យស្ត្រីទទួលទានត្រីសមុទ្រ (ដូចជាត្រីសាម៉ុន ឬត្រីធូណា) ដែលសម្បូរអាស៊ីតខ្លាញ់ Omega-3?",
    options: [
      "ជួយកាត់បន្ថយការរលាកក្នុងរាងកាយ និងជួយកាត់បន្ថយការឈឺចុកពោះពេលមករដូវ",
      "ធ្វើឱ្យមេរោគផ្សិតកើនឡើងលឿន",
      "ធ្វើឱ្យស្បូនត្រជាក់ខ្លាំង",
      "ជំនួសការផឹកទឹកស្អាតប្រចាំថ្ងៃ",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ១៧៖ អាស៊ីតខ្លាញ់ល្អ Omega-3 ក្នុងត្រីសមុទ្រ ជួយប្រឆាំងការរលាក សម្រួលចរន្តឈាម និងកាត់បន្ថយការឈឺចុកពោះពេលមករដូវ។",
  },
  {
    id: "q31",
    lesson: "មេរៀនទី ៩៖ ការការពារស្បូនលូនក្រោយសម្រាលកូន",
    question: "ក្រៅពីការញ៉ាំ Emmi និងហាត់ប្រាណ Kegel តើទម្លាប់ប្រចាំថ្ងៃអ្វីដែលស្ត្រីមានបញ្ហាស្បូនលូនត្រូវចៀសវាងដាច់ខាត?",
    options: [
      "ចៀសវាងការលើករបស់ធ្ងន់ៗ និងចៀសវាងការទល់លាមក (ព្រោះការប្រឹងខ្លាំងធ្វើឱ្យសម្ពាធសង្កត់លើស្បូនកាន់តែខ្លាំង)",
      "ចៀសវាងការញ៉ាំបន្លែ និងផ្លែឈើសម្បូរជាតិសរសៃ",
      "ចៀសវាងការផឹកទឹកក្ដៅឧណ្ហៗ",
      "ចៀសវាងការសម្រាកពេលយប់",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៩៖ ការលើករបស់ធ្ងន់ និងការប្រឹងពេលទល់លាមក ធ្វើឱ្យសម្ពាធក្នុងពោះសង្កត់លើស្បូនឱ្យកាន់តែលូនធ្លាក់ទាប។",
  },
  {
    id: "q32",
    lesson: "តិចនិកដោះស្រាយការបដិសេធ៖ ភ្ញៀវថា «តម្លៃថ្លៃ»",
    question: "នៅពេលភ្ញៀវរុញរាថា «Emmi តម្លៃ $25 ថ្លៃពេក» តើអ្នកលក់គួរពន្យល់ប្រៀបធៀបតាមមេរៀនទី ២ (ផលប៉ះពាល់សេដ្ឋកិច្ច) យ៉ាងដូចម្តេច?",
    options: [
      "ពន្យល់ថាការចំណាយត្រឹម $25 ដើម្បីការពារ និងថែទាំស្បូនពេលនេះ គឺតិចជាងឆ្ងាយណាស់បើធៀបនឹងការទុកឱ្យរលាកធ្ងន់ធ្ងរដែលត្រូវចំណាយរាប់រយរាប់ពាន់ដុល្លារលើការវះកាត់នៅមន្ទីរពេទ្យ",
      "ខឹងភ្ញៀវ ហើយឈប់ឆ្លើយតបសារ",
      "កុហកភ្ញៀវថាញ៉ាំតែ ១ គ្រាប់ជាដាច់អស់មួយជីវិត",
      "បង្ខំឱ្យភ្ញៀវខ្ចីលុយគេមកទិញ ១០ ប្រអប់",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ២៖ ការលក់ Emmi គឺជាការលក់ «ការការពារ» និងជួយសន្សំសំចៃថវិកាគ្រួសារកុំឱ្យខាតបង់ធំលើថ្លៃពេទ្យនៅពេលជំងឺវិវត្តទៅជាធ្ងន់ធ្ងរ។",
  },
  {
    id: "q33",
    lesson: "តិចនិកប្រឹក្សា៖ ស្ត្រីកំពុងបំបៅដោះកូន",
    question: "ប្រសិនបើភ្ញៀវទើបសម្រាលកូន និងកំពុងបំបៅដោះកូន សួរថាអាចញ៉ាំ Emmi បានឬទេ តើអ្នកលក់គួរណែនាំបែបណា?",
    options: [
      "អាចញ៉ាំបានយ៉ាងមានសុវត្ថិភាព (សម្រាលរួចចាប់ពី ១ ខែឡើងទៅ) ជួយលាងសម្អាតឈាមអាក្រក់ក្រោយសម្រាល ពង្រឹងស្បូនឱ្យឆាប់រួមតឹងណែន និងមិនប៉ះពាល់ទឹកដោះកូនឡើយ",
      "ហាមញ៉ាំដាច់ខាតរហូតដល់កូនអាយុ ១០ ឆ្នាំ",
      "ឱ្យកូនតូចញ៉ាំជំនួសម្តាយ",
      "ឱ្យឈប់បំបៅដោះកូនភ្លាមៗ",
    ],
    correctIndex: 0,
    explanation: "ស្ត្រីក្រោយសម្រាលកូន (១ ខែឡើងទៅ) ត្រូវការ Emmi ដើម្បីជួយសម្អាតឈាមសល់ក្នុងស្បូន បំបាត់ធ្លាក់សឆ្អាប និងពង្រឹងសាច់ដុំស្បូនឱ្យត្រឡប់មកតឹងណែនវិញ។",
  },
  {
    id: "q34",
    lesson: "ចំណេះដឹងផលិតផល៖ Kidney Pro & Pro D.O",
    question: "ប្រសិនបើអតិថិជនត្អូញត្អែរពីបញ្ហា នោមញឹកពេលយប់ នោមទាស់ នោមឈឺ និងចុករោយចង្កេះ តើគួរណែនាំផលិតផលមួយណារបស់ក្រុមហ៊ុន?",
    options: [
      "Kidney Pro (ឬឈុត Kidney Pro + Pro D.O) ដើម្បីជំនួយតម្រងនោម និងបញ្ចុះជាតិពុល",
      "ណែនាំឱ្យផឹកទឹកក្រូចកំប៉ុងឱ្យច្រើន",
      "ណែនាំឱ្យទប់នោមពេញមួយថ្ងៃ",
      "ណែនាំឱ្យញ៉ាំអាហារប្រៃៗបន្ថែម",
    ],
    correctIndex: 0,
    explanation: "Kidney Pro ជួយសម្អាត និងពង្រឹងតម្រងនោម បំបាត់អាការៈនោមញឹក នោមទាស់ ចុកចង្កេះ ហើយបើផ្គួបជាមួយ Pro D.O ជួយជំរុញចរន្តឈាម និងកោសិកាឱ្យកាន់តែរឹងមាំ។",
  },
  {
    id: "q35",
    lesson: "មេរៀនទី ៣៖ ការប្រើទឹកអប់បាញ់សម្អាត និងសាប៊ូដុសខ្លួន",
    question: "ហេតុអ្វីបានជាការយកសាប៊ូដុសខ្លួនទូទៅ ឬទឹកអប់បាញ់សម្អាតដែលមានជាតិកាត់ខ្លាំង ទៅលាងសម្អាតតំបន់ពិសេស ធ្វើឱ្យកាន់តែធ្លាក់ស និងរមាស់?",
    options: [
      "ព្រោះវាធ្វើឱ្យខូចតុល្យភាពកម្រិតអាស៊ីតធម្មជាតិ (pH) និងសម្លាប់បាក់តេរីល្អដែលការពារទ្វារមាស",
      "ព្រោះវាធ្វើឱ្យទឹកប្រែជាត្រជាក់ពេក",
      "ព្រោះវាធ្វើឱ្យសាច់ដុំអាងត្រគាករឹងពេក",
      "ព្រោះវាធ្វើឱ្យឈាមរដូវមកលឿនជាងមុន",
    ],
    correctIndex: 0,
    explanation: "តាមមេរៀនទី ៣ និងទី ៥៖ ការប្រើសាប៊ូដុសខ្លួនទូទៅ ឬទឹកអប់បាញ់សម្អាតដែលមានកម្រិត pH មិនត្រឹមត្រូវ នឹងបំផ្លាញរបាំងការពារធម្មជាតិរបស់ទ្វារមាស។",
  },
];

// Randomize the 4 answer choices (ក, ខ, គ, ឃ) every time a question is presented
function shuffleQuizQuestionOptions(q: QuizQuestion): QuizQuestion {
  const correctText = q.options[q.correctIndex];
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const newOptions = indices.map((i) => q.options[i]) as [string, string, string, string];
  const newCorrectIndex = newOptions.indexOf(correctText);
  return {
    ...q,
    options: newOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

const KHMER_MONTHS = [
  { value: 1, name: "មករា (01)" },
  { value: 2, name: "កុម្ភៈ (02)" },
  { value: 3, name: "មីនា (03)" },
  { value: 4, name: "មេសា (04)" },
  { value: 5, name: "ឧសភា (05)" },
  { value: 6, name: "មិថុនា (06)" },
  { value: 7, name: "កក្កដា (07)" },
  { value: 8, name: "សីហា (08)" },
  { value: 9, name: "កញ្ញា (09)" },
  { value: 10, name: "តុលា (10)" },
  { value: 11, name: "វិច្ឆិកា (11)" },
  { value: 12, name: "ធ្នូ (12)" },
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

const formatDDMMYYYY = (isoStr: string) => {
  if (!isoStr) return "";
  const parts = isoStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

export default function EmmiCRMApp() {
  // Authentication & session
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserOption>(ALL_USERS[1]); // Default Sok Chakriya
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<string>("Porch Srey Neat");
  const [currentRole, setCurrentRole] = useState<"admin" | "seller">("seller");

  // Navigation: Default to dashboard (which has full ranking)
  const [activeTab, setActiveTab] = useState<"dashboard" | "customers" | "reports" | "ranking" | "order">("dashboard");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Appearance
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [language, setLanguage] = useState<"km" | "en">("km");

  // Ranking filters: ថ្ងៃនេះ | ម្សិលមិញ | ខែនេះ
  const [rankingPeriod, setRankingPeriod] = useState<"today" | "yesterday" | "monthly">("monthly");
  // Leadership Business Status & Sales Date Filter (ថ្ងៃ | ខែ (រួមបញ្ចូលឆ្នាំ) | កំណត់)
  const [salesFilterTab, setSalesFilterTab] = useState<"day" | "month" | "custom">("day");
  const [salesFilterDay, setSalesFilterDay] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [salesFilterMonth, setSalesFilterMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [salesFilterYear, setSalesFilterYear] = useState<number>(() => new Date().getFullYear());
  const [salesFilterStartDate, setSalesFilterStartDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  });
  const [salesFilterEndDate, setSalesFilterEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  // Ranking Category: Rank ផលិតផល & គោលដៅ vs ចំណាត់ថ្នាក់ទម្លាក់ Report
  const [rankingCategory, setRankingCategory] = useState<"sales" | "reports">("sales");
  const [reportRankType, setReportRankType] = useState<"fastest" | "most">("fastest");

  // Customer filters
  const [customerFilterTab, setCustomerFilterTab] = useState<"today_followup" | "overdue" | "near_runout" | "followed_up" | "all">("today_followup");
  const [customerMonthFilter, setCustomerMonthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [adminSellerFilter, setAdminSellerFilter] = useState<string>("all");

  // Admin Master Control Dashboard state
  const [adminSubTab, setAdminSubTab] = useState<"sales" | "followups" | "reports" | "proof">("sales");
  const [adminViewMode, setAdminViewMode] = useState<"admin" | "seller_preview">("admin");
  const [proofSellerFilter, setProofSellerFilter] = useState<string>("all");
  const [proofSearch, setProofSearch] = useState<string>("");

  // Local follow-up log tracker
  const [followUpNotes, setFollowUpNotes] = useState<{
    [custId: string]: {
      count: number;
      note: string;
      date: string;
      nextFollowUp?: string;
      method?: string;
      status?: string;
    };
  }>({});
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [quickNote, setQuickNote] = useState<string>("");
  const [followUpModalDate, setFollowUpModalDate] = useState<string>("");
  const [followUpNextDate, setFollowUpNextDate] = useState<string>("");
  const [followUpMethod, setFollowUpMethod] = useState<string>("តាមឆាត");
  const [followUpStatus, setFollowUpStatus] = useState<string>("បាន Follow Up រួច");

  // Report state
  const [reportSubTab, setReportSubTab] = useState<"daily" | "weekly">("daily");
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [chatGuests, setChatGuests] = useState<string>("0");
  const [chatTarget, setChatTarget] = useState<string>("0");
  const [oldCustomerBoxes, setOldCustomerBoxes] = useState<string>("0");
  const [soldCount, setSoldCount] = useState<string>("0");
  const [activities, setActivities] = useState<string>("");
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Native In-App Order Form State (ទម្រង់កុម្មង់ទំនិញ VST)
  const [orderDate, setOrderDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [orderTeam, setOrderTeam] = useState<string>("Vann_Sitha");
  const [orderSellerName, setOrderSellerName] = useState<string>("");
  const [orderProductName, setOrderProductName] = useState<string>("Emmi");
  const [orderSellerNo, setOrderSellerNo] = useState<string>("");
  const [orderProductQty, setOrderProductQty] = useState<string>("1");
  const [orderBonusQty, setOrderBonusQty] = useState<string>("0");
  const [orderPrice, setOrderPrice] = useState<string>("");
  const [orderReceiverPhone, setOrderReceiverPhone] = useState<string>("");
  const [orderReceiverName, setOrderReceiverName] = useState<string>("");
  const [orderAddress, setOrderAddress] = useState<string>("");
  const [orderDelivery, setOrderDelivery] = useState<string>("VET");
  const [orderNote, setOrderNote] = useState<string>("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>("");

  // AI Consultation & Difficult Buyer Coach State
  const [aiCategory, setAiCategory] = useState<string>("tough_medical");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiStructured, setAiStructured] = useState<{
    sellerCoaching: string;
    shortReply: string;
    detailedReply: string;
    followUpHook: string;
  } | null>(null);
  const [aiCopiedKey, setAiCopiedKey] = useState<string>("");
  const [aiError, setAiError] = useState<string>("");

  const handleAskAi = async (customQuestion?: string) => {
    const questionToAsk = (customQuestion || aiPrompt).trim();
    if (!questionToAsk) {
      showToast("សូមបញ្ចូលសំណួរ ឬសារដែលភ្ញៀវសួរ!");
      return;
    }

    if (customQuestion) {
      setAiPrompt(customQuestion);
    }

    setAiLoading(true);
    setAiError("");
    setAiCopiedKey("");

    const activeCat = AI_CONSULTATION_CATEGORIES.find((c) => c.id === aiCategory);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: questionToAsk,
          category: activeCat ? activeCat.label : "",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.structured) {
          setAiStructured(data.structured);
          setAiResult(data.text || "");
        } else if (data.text) {
          setAiStructured(null);
          setAiResult(data.text);
        }
      } else {
        setAiError(data.message || "មិនអាចទាញយកចម្លើយបានទេ សូមព្យាយាមម្តងទៀត!");
      }
    } catch (err: any) {
      setAiError(err.message || "មានបញ្ហាបណ្តាញ សូមព្យាយាមម្តងទៀត!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAiPart = (textToCopy: string, keyName: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setAiCopiedKey(keyName);
    showToast("✅ បាន Copy សារសម្រាប់ផ្ញើទៅភ្ញៀវរួចរាល់!");
    setTimeout(() => setAiCopiedKey(""), 3000);
  };

  // ==========================================
  // SELLER SKILL QUIZ (តេស្តសាកល្បងសមត្ថភាពអ្នកលក់ ឆ្លាស់គ្នាគ្មានដែនកំណត់ + មិនជាន់សំណួរ + ដាក់ពិន្ទុ)
  // ==========================================
  const [quizPool, setQuizPool] = useState<QuizQuestion[]>(() => SELLER_QUIZ_BANK);
  const [quizUsedIds, setQuizUsedIds] = useState<string[]>(["q1"]);
  const [quizCurrent, setQuizCurrent] = useState<QuizQuestion>(() => SELLER_QUIZ_BANK[0]);
  const [quizSelectedIdx, setQuizSelectedIdx] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(0);
  const [quizStreak, setQuizStreak] = useState<number>(0);
  const [quizPrefetching, setQuizPrefetching] = useState<boolean>(false);
  const quizPrefetchRef = useRef<boolean>(false);

  // Background AI generator that continuously adds brand-new non-repeating questions
  const prefetchMoreAiQuestions = useCallback(
    async (currentPool: QuizQuestion[]) => {
      if (quizPrefetchRef.current) return;
      quizPrefetchRef.current = true;
      setQuizPrefetching(true);
      try {
        const recentQuestions = currentPool.slice(-30).map((q) => q.question);
        const res = await fetch("/api/ai/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recentQuestions }),
        });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizPool((prev) => {
            const existingTexts = new Set(prev.map((p) => p.question.trim()));
            const uniqueNew = (data.questions as QuizQuestion[]).filter(
              (nq) => nq.question && !existingTexts.has(nq.question.trim())
            );
            const merged = [...prev, ...uniqueNew];
            try {
              const aiOnly = merged.filter((q) => q.id.startsWith("ai_")).slice(-60);
              localStorage.setItem("emmi_seller_quiz_ai_bank_v1", JSON.stringify(aiOnly));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      } catch {
        // ignore network errors silently
      } finally {
        quizPrefetchRef.current = false;
        setQuizPrefetching(false);
      }
    },
    []
  );

  // Pick a random question on initial client load & restore saved score + AI bank
  useEffect(() => {
    try {
      let fullPool = [...SELLER_QUIZ_BANK];
      const savedAiBank = localStorage.getItem("emmi_seller_quiz_ai_bank_v1");
      if (savedAiBank) {
        const parsedAi = JSON.parse(savedAiBank);
        if (Array.isArray(parsedAi) && parsedAi.length > 0) {
          const existingTexts = new Set(fullPool.map((p) => p.question.trim()));
          for (const aq of parsedAi) {
            if (aq?.question && !existingTexts.has(aq.question.trim())) {
              fullPool.push(aq);
            }
          }
        }
      }
      setQuizPool(fullPool);

      const saved = localStorage.getItem("emmi_seller_quiz_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        const used: string[] = Array.isArray(parsed.usedIds) && parsed.usedIds.length > 0 ? parsed.usedIds : [];
        setQuizScore(Number(parsed.score) || 0);
        setQuizCorrectCount(Number(parsed.correctCount) || 0);
        setQuizAnsweredCount(Number(parsed.answeredCount) || 0);
        setQuizStreak(Number(parsed.streak) || 0);

        const remaining = fullPool.filter((q) => !used.includes(q.id));
        const pool = remaining.length > 0 ? remaining : fullPool;
        const randomQ = shuffleQuizQuestionOptions(pool[Math.floor(Math.random() * pool.length)]);
        setQuizCurrent(randomQ);
        setQuizUsedIds(remaining.length > 0 ? [...used, randomQ.id] : [randomQ.id]);

        if (remaining.length < 12) {
          prefetchMoreAiQuestions(fullPool);
        }
      } else {
        const randomQ = shuffleQuizQuestionOptions(
          fullPool[Math.floor(Math.random() * fullPool.length)]
        );
        setQuizCurrent(randomQ);
        setQuizUsedIds([randomQ.id]);
        prefetchMoreAiQuestions(fullPool);
      }
    } catch {
      // ignore storage errors
    }
  }, [prefetchMoreAiQuestions]);

  const saveQuizProgress = (
    nextScore: number,
    nextCorrect: number,
    nextAnswered: number,
    nextStreak: number,
    nextUsedIds: string[]
  ) => {
    try {
      localStorage.setItem(
        "emmi_seller_quiz_v1",
        JSON.stringify({
          score: nextScore,
          correctCount: nextCorrect,
          answeredCount: nextAnswered,
          streak: nextStreak,
          usedIds: nextUsedIds,
        })
      );
    } catch {
      // ignore
    }
  };

  const handleSelectQuizOption = (idx: number) => {
    if (quizSelectedIdx !== null) return; // Already answered this question
    setQuizSelectedIdx(idx);
    const isCorrect = idx === quizCurrent.correctIndex;
    const nextScore = isCorrect ? quizScore + 10 : quizScore;
    const nextCorrect = isCorrect ? quizCorrectCount + 1 : quizCorrectCount;
    const nextAnswered = quizAnsweredCount + 1;
    const nextStreak = isCorrect ? quizStreak + 1 : 0;

    setQuizScore(nextScore);
    setQuizCorrectCount(nextCorrect);
    setQuizAnsweredCount(nextAnswered);
    setQuizStreak(nextStreak);
    saveQuizProgress(nextScore, nextCorrect, nextAnswered, nextStreak, quizUsedIds);

    // Pre-fetch new AI questions in the background while seller reads explanation
    const remainingCount = quizPool.filter((q) => !quizUsedIds.includes(q.id)).length;
    if (remainingCount < 15) {
      prefetchMoreAiQuestions(quizPool);
    }
  };

  const handleNextQuizQuestion = () => {
    const unused = quizPool.filter((q) => !quizUsedIds.includes(q.id));
    // Always alternate lessons so consecutive questions are from different topics
    const unusedDiffLesson = unused.filter((q) => q.lesson !== quizCurrent.lesson);
    let nextQ: QuizQuestion;
    let nextUsed: string[];

    if (unusedDiffLesson.length > 0) {
      nextQ = unusedDiffLesson[Math.floor(Math.random() * unusedDiffLesson.length)];
      nextUsed = [...quizUsedIds, nextQ.id];
    } else if (unused.length > 0) {
      nextQ = unused[Math.floor(Math.random() * unused.length)];
      nextUsed = [...quizUsedIds, nextQ.id];
    } else {
      const diffPool = quizPool.filter(
        (q) => q.id !== quizCurrent.id && q.lesson !== quizCurrent.lesson
      );
      const fallbackPool = diffPool.length > 0 ? diffPool : quizPool.filter((q) => q.id !== quizCurrent.id);
      nextQ = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      nextUsed = [nextQ.id];
    }

    const shuffledNext = shuffleQuizQuestionOptions(nextQ);
    setQuizCurrent(shuffledNext);
    setQuizUsedIds(nextUsed);
    setQuizSelectedIdx(null);
    saveQuizProgress(quizScore, quizCorrectCount, quizAnsweredCount, quizStreak, nextUsed);

    if (unused.length < 15) {
      prefetchMoreAiQuestions(quizPool);
    }
  };

  const handleResetQuizScore = () => {
    const diffPool = quizPool.filter((q) => q.lesson !== quizCurrent.lesson);
    const pool = diffPool.length > 0 ? diffPool : quizPool;
    const randomQ = shuffleQuizQuestionOptions(pool[Math.floor(Math.random() * pool.length)]);
    setQuizScore(0);
    setQuizCorrectCount(0);
    setQuizAnsweredCount(0);
    setQuizStreak(0);
    setQuizSelectedIdx(null);
    setQuizCurrent(randomQ);
    setQuizUsedIds([randomQ.id]);
    saveQuizProgress(0, 0, 0, 0, [randomQ.id]);
    showToast("🔄 បានកំណត់ពិន្ទុតេស្តសាកល្បងឡើងវិញរួចរាល់!");
  };

  // Performance & Smooth pagination for 1,000+ customers
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Data
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [followUpEvents, setFollowUpEvents] = useState<FollowUpEvent[]>([]);

  // Load saved local storage session & followups (Permanent Login Persistence)
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("emmi_auth_session");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
          if (parsed.currentUser) setCurrentUser(parsed.currentUser);
          if (parsed.currentRole) setCurrentRole(parsed.currentRole);
          if (parsed.adminViewMode) setAdminViewMode(parsed.adminViewMode);
        }
      }
      const savedFollowups = localStorage.getItem("emmi_followups");
      if (savedFollowups) setFollowUpNotes(JSON.parse(savedFollowups));
      const savedLang = localStorage.getItem("emmi_language");
      if (savedLang === "en" || savedLang === "km") setLanguage(savedLang);
      const savedFont = localStorage.getItem("emmi_font_size");
      if (savedFont === "sm" || savedFont === "md" || savedFont === "lg") setFontSize(savedFont);
    } catch {} finally {
      setAuthChecked(true);
    }
  }, []);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  // Sync standardized font size
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (fontSize === "sm") {
        document.documentElement.style.fontSize = "14px";
      } else if (fontSize === "lg") {
        document.documentElement.style.fontSize = "18px";
      } else {
        document.documentElement.style.fontSize = "16px";
      }
    }
  }, [fontSize]);

  const handleLanguageChange = (lang: "km" | "en") => {
    setLanguage(lang);
    try {
      localStorage.setItem("emmi_language", lang);
    } catch {}
    showToast(lang === "km" ? "🇰🇭 បានប្តូរទៅជាភាសាខ្មែរ" : "🇬🇧 Switched to English");
  };

  const handleFontSizeChange = (size: "sm" | "md" | "lg") => {
    setFontSize(size);
    try {
      localStorage.setItem("emmi_font_size", size);
    } catch {}
    const label = size === "sm" ? "តូច (Compact)" : size === "lg" ? "ធំ (Large)" : "ស្តង់ដា (Standard)";
    showToast(`🔤 បានកំណត់ទំហំអក្សរ៖ ${label}`);
  };

  // Fetch live Sheet data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, repRes, folRes] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/reports", { cache: "no-store" }),
        fetch("/api/followups", { cache: "no-store" }),
      ]);

      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData.customers || []);
        setSales(custData.sales || []);
      }

      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData.reports || []);
      }

      if (folRes && folRes.ok) {
        const folData = await folRes.json();
        setFollowUpEvents(folData.events || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Login
  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");

    if (selectedUser.role === "admin") {
      if (!adminPassword.trim()) {
        setLoginError("សូមបញ្ចូល Admin Password!");
        return;
      }
      setLoggingIn(true);
      try {
        const res = await fetch("/api/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setCurrentUser("EMMI Admin");
          setCurrentRole("admin");
          setAdminViewMode("admin");
          setIsLoggedIn(true);
          setAdminPassword("");
          try {
            localStorage.setItem(
              "emmi_auth_session",
              JSON.stringify({
                isLoggedIn: true,
                currentUser: "EMMI Admin",
                currentRole: "admin",
                adminViewMode: "admin",
              })
            );
          } catch {}
        } else {
          setLoginError("Password មិនត្រឹមត្រូវទេ! (សាកល្បង Emmi@1111)");
        }
      } catch {
        setLoginError("ការតភ្ជាប់មានបញ្ហា");
      } finally {
        setLoggingIn(false);
      }
    } else {
      // Seller logs in directly
      setCurrentUser(selectedUser.name);
      setCurrentRole("seller");
      setIsLoggedIn(true);
      try {
        localStorage.setItem(
          "emmi_auth_session",
          JSON.stringify({
            isLoggedIn: true,
            currentUser: selectedUser.name,
            currentRole: "seller",
          })
        );
      } catch {}
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDrawerOpen(false);
    setAdminPassword("");
    setLoginError("");
    try {
      localStorage.removeItem("emmi_auth_session");
    } catch {}
  };

  // Reset pagination when customer filter tab or search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [customerFilterTab, customerMonthFilter, searchQuery, adminSellerFilter]);

  // Submit Daily Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setReportSuccess(false);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller: currentUser,
          date: reportDate,
          chatGuests: parseInt(chatGuests) || 0,
          chatTarget: parseInt(chatTarget) || 0,
          oldCustomerBoxes: parseInt(oldCustomerBoxes) || 0,
          soldCount: parseInt(soldCount) || 0,
          activities,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setActivities("");
        setChatGuests("0");
        setChatTarget("0");
        setOldCustomerBoxes("0");
        setSoldCount("0");
        await fetchData();
        showToast("✅ បានទម្លាក់ Daily Report ចូល Google Sheet រួចរាល់!");
        setTimeout(() => setReportSuccess(false), 5000);
      } else {
        showToast("❌ មិនអាចរក្សាទុករបាយការណ៍បានទេ");
      }
    } catch (err) {
      showToast("❌ មានបញ្ហាក្នុងការផ្ញើរបាយការណ៍");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Submit Native In-App Order Form directly to Google Form / Sheet
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSellerName.trim()) {
      showToast("សូមបញ្ចូលឈ្មោះអ្នកលក់!");
      setOrderError("សូមបញ្ចូលឈ្មោះអ្នកលក់ (Seller Name)!");
      return;
    }
    if (!orderPrice.trim()) {
      showToast("សូមបញ្ចូលតម្លៃទំនិញ!");
      setOrderError("សូមបញ្ចូលតម្លៃ (Price)!");
      return;
    }
    if (!orderReceiverPhone.trim()) {
      showToast("សូមបញ្ចូលលេខទូរស័ព្ទអ្នកទទួល!");
      setOrderError("សូមបញ្ចូលលេខទូរស័ព្ទអ្នកទទួល (Receiver Phone)!");
      return;
    }
    if (!orderAddress.trim()) {
      showToast("សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន!");
      setOrderError("សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន (Address)!");
      return;
    }

    setSubmittingOrder(true);
    setOrderError("");
    setOrderSuccess(false);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: orderDate,
          team: orderTeam || "Vann_Sitha",
          sellerName: orderSellerName.trim(),
          sellerNo: orderSellerNo,
          productName: orderProductName,
          productQuantity: orderProductQty,
          price: orderPrice.trim(),
          receiverPhone: orderReceiverPhone,
          receiverName: orderReceiverName,
          address: orderAddress,
          deliveryMethod: orderDelivery,
          note: orderNote,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setOrderSuccess(true);
        showToast("✅ បានបញ្ជូនការកុម្ម៉ង់ចូល Google Sheet ជោគជ័យ!");
        // Reset order-specific fields, preserve sellerName & team
        setOrderReceiverPhone("");
        setOrderReceiverName("");
        setOrderAddress("");
        setOrderNote("");
        setOrderProductQty("1");
        setOrderBonusQty("0");
        setOrderPrice("");
        setTimeout(() => setOrderSuccess(false), 7000);
      } else {
        const errMsg = data.message || "មិនអាចបញ្ជូនការកុម្ម៉ង់បានទេ សូមព្យាយាមម្តងទៀត!";
        setOrderError(errMsg);
        showToast("❌ " + errMsg);
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setOrderError("បាត់បង់ការតភ្ជាប់អ៊ីនធឺណិត សូមព្យាយាមម្តងទៀត!");
      showToast("❌ បាត់បង់ការតភ្ជាប់");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // ==========================================
  // REAL DATES & SALES COMPARISONS
  // ==========================================
  const datesInfo = useMemo(() => {
    const now = new Date();
    // Today YYYY-MM-DD
    const todayStr = now.toISOString().slice(0, 10); // "2026-10-31"

    // Yesterday YYYY-MM-DD
    const yDate = new Date(now.getTime() - 24 * 3600 * 1000);
    const yesterdayStr = yDate.toISOString().slice(0, 10); // "2026-10-30"

    // Current month & previous month
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const curMonthStr = `${curYear}-${String(curMonth).padStart(2, "0")}`; // "2026-10"

    const prevMonthDate = new Date(curYear, now.getMonth() - 1, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`; // "2026-09"

    let todayBoxes = 0;
    let yesterdayBoxes = 0;
    let monthBoxes = 0;
    let lastMonthBoxes = 0;

    sales.forEach((s) => {
      if (s.date === todayStr) todayBoxes += s.quantity;
      if (s.date === yesterdayStr) yesterdayBoxes += s.quantity;
      if (s.date.startsWith(curMonthStr)) monthBoxes += s.quantity;
      if (s.date.startsWith(prevMonthStr)) lastMonthBoxes += s.quantity;
    });

    const dailyDiff =
      yesterdayBoxes > 0
        ? Math.round(((todayBoxes - yesterdayBoxes) / yesterdayBoxes) * 100)
        : todayBoxes > 0
        ? 100
        : 0;

    const monthlyDiff =
      lastMonthBoxes > 0
        ? Math.round(((monthBoxes - lastMonthBoxes) / lastMonthBoxes) * 100)
        : 0;

    return {
      todayStr,
      yesterdayStr,
      todayBoxes,
      yesterdayBoxes,
      dailyDiff,
      monthBoxes,
      lastMonthBoxes,
      monthlyDiff,
      curMonthStr,
    };
  }, [sales]);

  // ==========================================
  // ACTIVE SALES DATE RANGE & FILTERED SALES
  // ==========================================
  const activeSalesDateRange = useMemo(() => {
    let start = "";
    let end = "";
    let displayText = "";

    if (salesFilterTab === "day") {
      start = salesFilterDay;
      end = salesFilterDay;
      displayText = formatDDMMYYYY(salesFilterDay);
    } else if (salesFilterTab === "month") {
      const y = salesFilterYear;
      const m = String(salesFilterMonth).padStart(2, "0");
      const lastDayOfMonth = new Date(y, salesFilterMonth, 0).getDate();
      start = `${y}-${m}-01`;
      end = `${y}-${m}-${String(lastDayOfMonth).padStart(2, "0")}`;
      const today = datesInfo.todayStr;
      const isCurrentMonth = today.startsWith(`${y}-${m}`);
      const actualEnd = isCurrentMonth && today < end ? today : end;
      displayText = `${formatDDMMYYYY(start)} – ${formatDDMMYYYY(actualEnd)}${isCurrentMonth ? " · គិតមកដល់ថ្ងៃនេះ" : ""}`;
    } else {
      start = salesFilterStartDate <= salesFilterEndDate ? salesFilterStartDate : salesFilterEndDate;
      end = salesFilterStartDate <= salesFilterEndDate ? salesFilterEndDate : salesFilterStartDate;
      displayText = `${formatDDMMYYYY(start)} – ${formatDDMMYYYY(end)}`;
    }

    return { start, end, displayText };
  }, [salesFilterTab, salesFilterDay, salesFilterMonth, salesFilterYear, salesFilterStartDate, salesFilterEndDate, datesInfo.todayStr]);

  // Filtered sales based on active sales date range
  const filteredSales = useMemo(() => {
    const { start, end } = activeSalesDateRange;
    return sales.filter((s) => s.date >= start && s.date <= end);
  }, [sales, activeSalesDateRange]);

  // 4-Stat Sales Summary metrics (លក់សរុប, អ្នកលក់ដែលបានលក់, ផលិតផលបានលក់, ថ្ងៃមានការលក់)
  const salesSummaryStats = useMemo(() => {
    let totalBoxes = 0;
    const totalOrders = filteredSales.length;
    const activeSellersSet = new Set<string>();
    const uniqueProductsSet = new Set<string>();
    const salesDaysSet = new Set<string>();

    filteredSales.forEach((s) => {
      totalBoxes += s.quantity;
      if (s.seller) activeSellersSet.add(s.seller.trim().toLowerCase());
      if (s.product) uniqueProductsSet.add(s.product.trim().toLowerCase());
      if (s.date) salesDaysSet.add(s.date);
    });

    return {
      totalBoxes,
      totalOrders,
      activeSellersCount: activeSellersSet.size,
      uniqueProductsCount: uniqueProductsSet.size,
      salesDaysCount: salesDaysSet.size,
    };
  }, [filteredSales]);

  // Aggregated seller performance for selected period
  const sellerStatsForPeriod = useMemo(() => {
    const statsMap = new Map<string, { totalBoxes: number; orderCount: number }>();
    filteredSales.forEach((s) => {
      const key = (s.seller || "").trim().toLowerCase();
      const existing = statsMap.get(key) || { totalBoxes: 0, orderCount: 0 };
      existing.totalBoxes += s.quantity;
      existing.orderCount += 1;
      statsMap.set(key, existing);
    });

    return ALL_USERS.filter((u) => u.role === "seller").map((seller) => {
      const key = seller.name.trim().toLowerCase();
      const data = statsMap.get(key) || { totalBoxes: 0, orderCount: 0 };
      return {
        seller,
        boxes: data.totalBoxes,
        orders: data.orderCount,
      };
    }).sort((a, b) => b.boxes - a.boxes);
  }, [filteredSales]);

  // Open Follow-up Modal with Date & Next Schedule
  const openFollowUpModal = (c: Customer) => {
    setModalCustomer(c);
    const local = followUpNotes[c.id];
    setQuickNote(local?.note || "");
    setFollowUpModalDate(datesInfo.todayStr);

    // Compute default next follow up:
    // 1 box = 15 days (milestones: Day 7, Day 14)
    // 2 boxes = 30 days (milestones: Day 7, Day 14, Day 21, Day 28)
    let defaultNext = "";
    if (c.purchaseDate) {
      const pDate = new Date(c.purchaseDate);
      const diffDays = Math.max(0, Math.floor((Date.now() - pDate.getTime()) / (1000 * 3600 * 24)));
      const milestones = c.boxes <= 1 ? [7, 14] : [7, 14, 21, 28];
      const nextMilestone = milestones.find((m) => m > diffDays);
      if (nextMilestone) {
        const nextD = new Date(pDate.getTime() + nextMilestone * 24 * 3600 * 1000);
        defaultNext = nextD.toISOString().slice(0, 10);
      }
    }
    if (!defaultNext) {
      const nextD = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      defaultNext = nextD.toISOString().slice(0, 10);
    }

    setFollowUpNextDate(local?.nextFollowUp || defaultNext);
    setFollowUpMethod(local?.method || "តាមឆាត");
    setFollowUpStatus(local?.status || "បាន Follow Up រួច");
  };

  // Record Follow-up
  const handleSaveFollowup = () => {
    if (!modalCustomer) return;
    const custId = modalCustomer.id;
    const current = followUpNotes[custId] || { count: modalCustomer.followUpCount || 0, note: "", date: "" };
    const noteText = quickNote || "បានទំនាក់ទំនងតាមដានផលិតផល";
    const todayDate = followUpModalDate || datesInfo.todayStr;
    const nextDate = followUpNextDate || "";

    const updated = {
      ...followUpNotes,
      [custId]: {
        count: current.count + 1,
        note: noteText,
        date: todayDate,
        nextFollowUp: nextDate,
        method: followUpMethod,
        status: followUpStatus,
      },
    };
    setFollowUpNotes(updated);
    try {
      localStorage.setItem("emmi_followups", JSON.stringify(updated));
    } catch {}

    // Background log to Sheets with all verified tracking fields
    fetch("/api/followups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: modalCustomer,
        actor: currentUser,
        followUpDate: todayDate,
        method: followUpMethod || "តាមឆាត",
        status: followUpStatus || "បាន Follow Up រួច",
        note: noteText,
        nextFollowUp: nextDate,
        boxes: modalCustomer.boxes,
      }),
    })
      .then(() => fetchData())
      .catch(() => {});

    showToast(`✅ បានកត់ត្រា Follow Up ជូន ${modalCustomer.name} (សរុប ${current.count + 1} ដង)! លើកបន្ទាប់ថ្ងៃ ${nextDate || "មិនបានកំណត់"}`);
    setModalCustomer(null);
    setQuickNote("");
  };

  // ==========================================
  // RANKING LEADERBOARD COMPUTATION
  // ==========================================
  const rankings = useMemo(() => {
    const sellerSalesMap: Record<string, number> = {};

    filteredSales.forEach((s) => {
      const seller = s.seller.trim();
      if (!seller) return;
      sellerSalesMap[seller] = (sellerSalesMap[seller] || 0) + s.quantity;
    });

    // If viewing and 0 sales yet, make sure users with 0 still show
    ALL_USERS.filter((u) => u.role === "seller").forEach((u) => {
      if (!(u.name in sellerSalesMap)) {
        sellerSalesMap[u.name] = 0;
      }
    });

    const isDaily = salesFilterTab === "day";

    const list = Object.entries(sellerSalesMap)
      .map(([name, total]) => {
        const u = ALL_USERS.find((x) => x.name.toLowerCase() === name.toLowerCase());
        // Daily goal is 5 boxes per person; Monthly goal is seller's monthly target
        const goal = isDaily ? 5 : (u?.goal || 200);
        const percent = Math.min(100, Math.round((total / goal) * 100));
        const initials = u?.initials || name.slice(0, 2).toUpperCase();
        return { name, total, goal, percent, initials };
      })
      .sort((a, b) => b.total - a.total);

    return list;
  }, [filteredSales, salesFilterTab]);

  // Logged-in seller's personal stats for daily & monthly goal
  const myPersonalStats = useMemo(() => {
    let today = 0;
    let yesterday = 0;
    let month = 0;
    const userLower = currentUser.trim().toLowerCase();

    sales.forEach((s) => {
      if (s.seller.trim().toLowerCase() === userLower) {
        if (s.date === datesInfo.todayStr) {
          today += s.quantity;
        }
        if (s.date === datesInfo.yesterdayStr) {
          yesterday += s.quantity;
        }
        if (s.date.startsWith(datesInfo.curMonthStr)) {
          month += s.quantity;
        }
      }
    });

    const u = ALL_USERS.find((x) => x.name.toLowerCase() === userLower);
    const myGoal = u?.goal || 200;

    return {
      today,
      yesterday,
      month,
      myGoal,
      dailyGoal: 5,
    };
  }, [sales, currentUser, datesInfo]);

  // Logged-in seller's rank info
  const myRankInfo = useMemo(() => {
    if (currentRole === "admin") return null;
    const index = rankings.findIndex((r) => r.name.toLowerCase() === currentUser.toLowerCase());
    if (index === -1) {
      return { rank: rankings.length, total: 0, name: currentUser };
    }
    return { rank: index + 1, total: rankings[index].total, name: currentUser };
  }, [rankings, currentUser, currentRole]);

  // Total boxes in current ranking view
  const currentTotalBoxes = useMemo(() => {
    return rankings.reduce((sum, r) => sum + r.total, 0);
  }, [rankings]);

  // ==========================================
  // REPORT RANKINGS (FASTEST & MOST)
  // ==========================================
  const reportRankings = useMemo(() => {
    // 1. Most reports submitted (បានច្រើនជាងគេ)
    const countMap: Record<string, { count: number; lastDate: string; lastTime: string }> = {};
    ALL_USERS.filter((u) => u.role === "seller").forEach((u) => {
      countMap[u.name] = { count: 0, lastDate: "", lastTime: "" };
    });

    reports.forEach((r) => {
      const seller = r.seller.trim();
      if (!countMap[seller]) {
        countMap[seller] = { count: 0, lastDate: "", lastTime: "" };
      }
      countMap[seller].count += 1;
      if (!countMap[seller].lastDate || r.date > countMap[seller].lastDate) {
        countMap[seller].lastDate = r.date;
        countMap[seller].lastTime = r.submittedAt;
      }
    });

    const mostList = Object.entries(countMap)
      .map(([name, d]) => {
        const u = ALL_USERS.find((x) => x.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          initials: u?.initials || name.slice(0, 2).toUpperCase(),
          count: d.count,
          lastDate: d.lastDate,
          lastTime: d.lastTime,
        };
      })
      .sort((a, b) => b.count - a.count);

    // 2. Fastest / Earliest submitters (លឿនជាងគេ)
    const allDates = reports.map((r) => r.date).filter(Boolean);
    const targetDate = allDates.length > 0 ? [...allDates].sort().reverse()[0] : datesInfo.todayStr;

    // Reports on targetDate
    const dateReports = reports.filter((r) => r.date === targetDate);

    const fastestList = dateReports
      .map((r) => {
        const u = ALL_USERS.find((x) => x.name.toLowerCase() === r.seller.toLowerCase());
        const d = new Date(r.submittedAt);
        const isValid = !isNaN(d.getTime());
        const minutes = isValid ? d.getHours() * 60 + d.getMinutes() : 9999;

        let formattedTime = "";
        if (isValid) {
          const h = d.getHours();
          const m = d.getMinutes().toString().padStart(2, "0");
          const ampm = h >= 12 ? "ល្ងាច" : "ព្រឹក";
          const h12 = h % 12 || 12;
          formattedTime = `ម៉ោង ${h12}:${m} ${ampm}`;
        } else {
          formattedTime = r.submittedAt || "មិនបានកត់ម៉ោង";
        }

        return {
          id: r.id,
          seller: r.seller,
          initials: u?.initials || r.seller.slice(0, 2).toUpperCase(),
          date: r.date,
          submittedAt: r.submittedAt,
          minutes,
          formattedTime,
          soldCount: r.soldCount,
          activities: r.activities,
        };
      })
      .sort((a, b) => a.minutes - b.minutes); // Earliest first!

    const submittedSellerNames = new Set(dateReports.map((r) => r.seller.toLowerCase()));
    const pendingSellers = ALL_USERS.filter(
      (u) => u.role === "seller" && !submittedSellerNames.has(u.name.toLowerCase())
    );

    return {
      mostList,
      fastestList,
      pendingSellers,
      targetDate,
      totalReported: dateReports.length,
      totalSellers: ALL_USERS.filter((u) => u.role === "seller").length,
    };
  }, [reports, datesInfo.todayStr]);

  // List of unique months from customer purchase data
  const availableCustomerMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    customers.forEach((c) => {
      if (c.purchaseDate && c.purchaseDate.length >= 7) {
        monthsSet.add(c.purchaseDate.slice(0, 7)); // e.g. "2026-10"
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [customers]);

  const formatKhmerMonth = (yyyyMm: string) => {
    if (yyyyMm === "all") return "ខែទាំងអស់";
    const parts = yyyyMm.split("-");
    if (parts.length < 2) return yyyyMm;
    const y = parts[0];
    const m = parts[1];
    const monthNames: Record<string, string> = {
      "01": "មករា",
      "02": "កុម្ភៈ",
      "03": "មីនា",
      "04": "មេសា",
      "05": "ឧសភា",
      "06": "មិថុនា",
      "07": "កក្កដា",
      "08": "សីហា",
      "09": "កញ្ញា",
      "10": "តុលា",
      "11": "វិច្ឆិកា",
      "12": "ធ្នូ",
    };
    return `ខែ${monthNames[m] || m} ${y}`;
  };

  const formatKhmerDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      return `${yyyy}-${mm}-${dd} ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  // ==========================================
  // ADMIN DASHBOARD ANALYTICS
  // 1. Daily Sales tracking per seller (today, yesterday, month)
  // 2. Follow-up counts per seller (due today, overdue, completed)
  // 3. Reports submitted and activities
  // 4. Audit trail proof from Google Sheets
  // ==========================================
  const adminSellerStats = useMemo(() => {
    const sellers = ALL_USERS.filter((u) => u.role === "seller");
    return sellers.map((seller) => {
      // Sales stats
      const sellerSales = sales.filter(
        (s) => s.seller.toLowerCase().trim() === seller.name.toLowerCase().trim()
      );
      const todaySales = sellerSales
        .filter((s) => s.date === datesInfo.todayStr)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);
      const yesterdaySales = sellerSales
        .filter((s) => s.date === datesInfo.yesterdayStr)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);
      const monthSales = sellerSales
        .filter((s) => s.date.startsWith(datesInfo.curMonthStr))
        .reduce((sum, s) => sum + (s.quantity || 0), 0);

      // Customer stats
      const sellerCusts = customers.filter(
        (c) => c.sellerId.toLowerCase().trim() === seller.name.toLowerCase().trim()
      );
      const totalCust = sellerCusts.length;
      const dueTodayCust = sellerCusts.filter((c) => c.isDueToday).length;
      const overdueCust = sellerCusts.filter((c) => c.isOverdue).length;
      const followedUpCust = sellerCusts.filter(
        (c) => (followUpNotes[c.id] && followUpNotes[c.id].count > 0) || c.followUpCount > 0
      ).length;
      const completionRate = totalCust > 0 ? Math.round((followedUpCust / totalCust) * 100) : 0;

      // Verification / Follow-up history stats from Google Sheet
      const sellerEvents = followUpEvents.filter(
        (e) => e.seller.toLowerCase().trim() === seller.name.toLowerCase().trim()
      );
      const todayEventsCount = sellerEvents.filter(
        (e) => e.followUpDate === datesInfo.todayStr || e.updatedAt.startsWith(datesInfo.todayStr)
      ).length;

      // Report stats
      const todayReport = reports.find(
        (r) =>
          r.seller.toLowerCase().trim() === seller.name.toLowerCase().trim() &&
          r.date === datesInfo.todayStr
      );

      return {
        seller,
        todaySales,
        yesterdaySales,
        monthSales,
        dailyGoal: 5,
        monthGoal: seller.goal || 200,
        totalCust,
        dueTodayCust,
        overdueCust,
        followedUpCust,
        completionRate,
        sellerEventsCount: sellerEvents.length,
        todayEventsCount,
        hasSubmittedReportToday: !!todayReport,
        todayReport,
      };
    });
  }, [sales, customers, followUpEvents, reports, datesInfo, followUpNotes]);

  const adminSummary = useMemo(() => {
    const totalTodaySales = adminSellerStats.reduce((sum, s) => sum + s.todaySales, 0);
    const totalYesterdaySales = adminSellerStats.reduce((sum, s) => sum + s.yesterdaySales, 0);
    const totalMonthSales = adminSellerStats.reduce((sum, s) => sum + s.monthSales, 0);
    const totalDueToday = adminSellerStats.reduce((sum, s) => sum + s.dueTodayCust, 0);
    const totalOverdue = adminSellerStats.reduce((sum, s) => sum + s.overdueCust, 0);
    const totalFollowedUp = adminSellerStats.reduce((sum, s) => sum + s.followedUpCust, 0);
    const totalReportsToday = adminSellerStats.filter((s) => s.hasSubmittedReportToday).length;
    const missingReportsSellers = adminSellerStats.filter((s) => !s.hasSubmittedReportToday);
    const totalVerifiedToday = adminSellerStats.reduce((sum, s) => sum + s.todayEventsCount, 0);

    return {
      totalTodaySales,
      totalYesterdaySales,
      totalMonthSales,
      totalDueToday,
      totalOverdue,
      totalFollowedUp,
      totalReportsToday,
      totalSellers: adminSellerStats.length,
      missingReportsSellers,
      totalVerifiedToday,
    };
  }, [adminSellerStats]);

  const adminProofList = useMemo(() => {
    return followUpEvents
      .filter((e) => {
        const matchSeller =
          proofSellerFilter === "all" ||
          e.seller.toLowerCase().trim() === proofSellerFilter.toLowerCase().trim();
        const matchSearch =
          !proofSearch ||
          (e.buyerName && e.buyerName.toLowerCase().includes(proofSearch.toLowerCase())) ||
          (e.phone && e.phone.includes(proofSearch)) ||
          (e.note && e.note.toLowerCase().includes(proofSearch.toLowerCase())) ||
          (e.location && e.location.toLowerCase().includes(proofSearch.toLowerCase()));
        return matchSeller && matchSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.followUpDate).getTime() -
          new Date(a.updatedAt || a.followUpDate).getTime()
      );
  }, [followUpEvents, proofSellerFilter, proofSearch]);

  // ==========================================
  // UNIFIED CUSTOMER FOLLOW-UP HELPER
  // ==========================================
  const getCustomerFollowInfo = useCallback(
    (c: Customer) => {
      const localFollow = followUpNotes[c.id];
      const cleanPhone = c.phone ? c.phone.replace(/[^0-9+]/g, "") : "";

      // Cross-reference with Sheet events
      const sheetEvents = followUpEvents.filter(
        (e) =>
          e.customerId === c.id ||
          (cleanPhone &&
            cleanPhone.length >= 8 &&
            e.phone &&
            e.phone.replace(/[^0-9]/g, "") === cleanPhone.replace(/[^0-9]/g, ""))
      );

      const latestSheetEvent =
        sheetEvents.length > 0
          ? [...sheetEvents].sort(
              (a, b) =>
                new Date(b.updatedAt || b.followUpDate).getTime() -
                new Date(a.updatedAt || a.followUpDate).getTime()
            )[0]
          : null;

      const totalFollowCount = Math.max(
        (c.followUpCount || 0) + (localFollow?.count || 0),
        sheetEvents.length,
        localFollow ? localFollow.count : 0
      );

      const isFollowedUp = totalFollowCount > 0;

      const lastFollowDate =
        localFollow?.date ||
        latestSheetEvent?.followUpDate ||
        (latestSheetEvent?.updatedAt ? latestSheetEvent.updatedAt.slice(0, 10) : "") ||
        "";

      // Compute default next follow up:
      let defaultNext = "";
      if (c.purchaseDate) {
        const pDate = new Date(c.purchaseDate);
        const diffDays = Math.max(0, Math.floor((Date.now() - pDate.getTime()) / (1000 * 3600 * 24)));
        const milestones = c.boxes <= 1 ? [7, 14] : [7, 14, 21, 28];
        const nextMilestone = milestones.find((m) => m > diffDays);
        if (nextMilestone) {
          const nextD = new Date(pDate.getTime() + nextMilestone * 24 * 3600 * 1000);
          defaultNext = nextD.toISOString().slice(0, 10);
        } else if (lastFollowDate) {
          const baseDate = new Date(lastFollowDate);
          const nextD = new Date(baseDate.getTime() + 7 * 24 * 3600 * 1000);
          defaultNext = nextD.toISOString().slice(0, 10);
        }
      }

      const nextFollowDate =
        localFollow?.nextFollowUp ||
        latestSheetEvent?.nextFollowUp ||
        c.nextFollowUp ||
        defaultNext;

      const isFollowedUpToday = lastFollowDate === datesInfo.todayStr;
      const isNextDueToday = !!nextFollowDate && nextFollowDate === datesInfo.todayStr;
      const isNextOverdue = !!nextFollowDate && nextFollowDate < datesInfo.todayStr;

      return {
        isFollowedUp,
        totalFollowCount,
        lastFollowDate,
        nextFollowDate,
        isFollowedUpToday,
        isNextDueToday,
        isNextOverdue,
        note: localFollow?.note || latestSheetEvent?.note || "",
        method: localFollow?.method || latestSheetEvent?.method || "",
        status: localFollow?.status || latestSheetEvent?.status || "",
      };
    },
    [followUpNotes, followUpEvents, datesInfo.todayStr]
  );

  const isDueTodayCustomer = useCallback(
    (c: Customer) => {
      const info = getCustomerFollowInfo(c);
      // Due today if milestone matches or nextFollowDate is today, AND not yet followed up today
      return !info.isFollowedUpToday && (c.isDueToday || info.isNextDueToday);
    },
    [getCustomerFollowInfo]
  );

  const isOverdueCustomer = useCallback(
    (c: Customer) => {
      const info = getCustomerFollowInfo(c);
      if (info.isFollowedUpToday) return false;
      if (!info.isFollowedUp) {
        return c.isOverdue && !c.isDueToday && !info.isNextDueToday;
      }
      return info.isNextOverdue;
    },
    [getCustomerFollowInfo]
  );

  const isFollowedUpCustomer = useCallback(
    (c: Customer) => {
      const info = getCustomerFollowInfo(c);
      return info.isFollowedUp;
    },
    [getCustomerFollowInfo]
  );

  // ==========================================
  // ISOLATED CUSTOMERS LIST
  // ==========================================
  const filteredCustomers = useMemo(() => {
    let list = customers;

    // Strict Seller Isolation:
    if (currentRole === "seller") {
      list = list.filter((c) => c.sellerId.toLowerCase() === currentUser.toLowerCase());
    } else if (adminSellerFilter !== "all") {
      list = list.filter((c) => c.sellerId.toLowerCase() === adminSellerFilter.toLowerCase());
    }

    // Month Filter: (កន្លែងបញ្ជីអតិថិជន ដាក់ខែអោយរើសផង)
    if (customerMonthFilter !== "all") {
      list = list.filter((c) => c.purchaseDate && c.purchaseDate.startsWith(customerMonthFilter));
    }

    // Apply Tab filter:
    if (customerFilterTab === "today_followup") {
      list = list.filter(isDueTodayCustomer);
    } else if (customerFilterTab === "overdue") {
      list = list.filter(isOverdueCustomer);
    } else if (customerFilterTab === "near_runout") {
      list = list.filter((c) => c.isNearRunout);
    } else if (customerFilterTab === "followed_up") {
      list = list.filter(isFollowedUpCustomer);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    customers,
    currentRole,
    currentUser,
    adminSellerFilter,
    customerMonthFilter,
    customerFilterTab,
    searchQuery,
    isDueTodayCustomer,
    isOverdueCustomer,
    isFollowedUpCustomer,
  ]);

  // Customer Count badges
  const customerCounts = useMemo(() => {
    let list = customers;
    if (currentRole === "seller") {
      list = list.filter((c) => c.sellerId.toLowerCase() === currentUser.toLowerCase());
    } else if (adminSellerFilter !== "all") {
      list = list.filter((c) => c.sellerId.toLowerCase() === adminSellerFilter.toLowerCase());
    }
    if (customerMonthFilter !== "all") {
      list = list.filter((c) => c.purchaseDate && c.purchaseDate.startsWith(customerMonthFilter));
    }

    return {
      all: list.length,
      today: list.filter(isDueTodayCustomer).length,
      overdue: list.filter(isOverdueCustomer).length,
      nearRunout: list.filter((c) => c.isNearRunout).length,
      followed: list.filter(isFollowedUpCustomer).length,
    };
  }, [
    customers,
    currentRole,
    currentUser,
    adminSellerFilter,
    customerMonthFilter,
    isDueTodayCustomer,
    isOverdueCustomer,
    isFollowedUpCustomer,
  ]);

  // Auto-switch to overdue tab if today follow-up is 0, so sellers immediately see pending work
  const hasAutoSwitchedCustomerTab = useRef(false);
  useEffect(() => {
    if (!hasAutoSwitchedCustomerTab.current && customers.length > 0) {
      if (customerCounts.today === 0 && customerCounts.overdue > 0 && customerFilterTab === "today_followup") {
        setCustomerFilterTab("overdue");
        hasAutoSwitchedCustomerTab.current = true;
      }
    }
  }, [customers.length, customerCounts.today, customerCounts.overdue, customerFilterTab]);

  // Paginated/Sliced customers for smooth 60fps rendering
  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, visibleCount);
  }, [filteredCustomers, visibleCount]);

  // Check if current user has submitted today's report
  const todayMyReport = useMemo(() => {
    return reports.find(
      (r) =>
        r.seller &&
        r.seller.trim().toLowerCase() === currentUser.trim().toLowerCase() &&
        r.date === datesInfo.todayStr
    );
  }, [reports, currentUser, datesInfo.todayStr]);

  // While verifying persistent login from localStorage, show clean smooth loader
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#fcf8f9] dark:bg-[#1c0a10] flex items-center justify-center font-khmer">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#7b1e3a] border-t-transparent animate-spin" />
          <p className="text-xs text-[#7b1e3a] dark:text-pink-300 font-bold">កំពុងបើកដំណើរការ EMMI CRM...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGIN SCREEN (matching user shots 5 & 6)
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#fcf8f9] dark:bg-[#1c0a10] text-[#230c14] dark:text-[#fcf4f6] font-khmer flex justify-center p-4 selection:bg-[#7b1e3a] selection:text-white">
        <div className="w-full max-w-md my-auto pb-8">
          {/* Top Bar with Brand & Controls */}
          <div className="flex items-center justify-between py-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 shadow-md">
                <img src="/emmi-logo.png" alt="EMMI" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-wider text-[#a62b4e] uppercase">EMMI</p>
                <p className="text-[10px] text-gray-500 font-medium">SALES CRM</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-[#eadadd] dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-sm"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={() => setFontSize(fontSize === "sm" ? "md" : fontSize === "md" ? "lg" : "sm")}
                className="h-10 px-3 rounded-xl bg-white dark:bg-white/10 border border-[#eadadd] dark:border-white/10 flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm"
              >
                <span className="text-base font-serif">T</span>
                <span className="text-[10px]">↕</span>
              </button>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#a62b4e] mb-1">សូមស្វាគមន៍</p>
            <h1 className="text-2xl font-black text-[#230c14] dark:text-white tracking-tight mb-2">
              ចូលប្រើ EMMI CRM
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Seller ជ្រើសរើសឈ្មោះរបស់ខ្លួន រួចចូលប្រើផ្ទាល់។ Admin ត្រូវបញ្ចូល Password ដើម្បីមើលទិន្នន័យទាំងក្រុម។
            </p>
          </div>

          {/* User Selection List */}
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {ALL_USERS.map((u) => {
                const isSelected = selectedUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setLoginError("");
                    }}
                    className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#fbe9ee] dark:bg-[#3e1321]/60 border-[#7b1e3a] dark:border-[#a62b4e] shadow-sm ring-1 ring-[#7b1e3a]"
                        : "bg-white dark:bg-white/5 border-[#eadadd] dark:border-white/10 hover:border-[#a62b4e]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                          u.role === "admin"
                            ? "bg-[#7b1e3a] text-white"
                            : isSelected
                            ? "bg-[#7b1e3a] text-white"
                            : "bg-[#f5e6ea] dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300"
                        }`}
                      >
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#230c14] dark:text-white">{u.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{u.title}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#7b1e3a] dark:text-pink-300">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Admin Password Input (if Admin selected) */}
            {selectedUser.role === "admin" && (
              <div className="pt-2 animate-fadeIn">
                <label className="block text-xs font-bold text-[#230c14] dark:text-gray-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="បញ្ចូល Password"
                    className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#eadadd] dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-[#7b1e3a] focus:ring-2 focus:ring-[#7b1e3a]/20"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full h-12 mt-4 rounded-xl bg-[#7b1e3a] hover:bg-[#66162e] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <span>{loggingIn ? "កំពុងផ្ទៀងផ្ទាត់..." : `ចូលជា ${selectedUser.name}`}</span>
              <ChevronRight size={18} />
            </button>
          </form>

          {/* Bottom Security Badge */}
          <div className="mt-6 p-3 rounded-xl bg-[#eafaf1] dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Seller ចូលតាមឈ្មោះ · Admin ការពារដោយ Password។</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper to render mobile-optimized date input box that NEVER overflows on iPhone/Android
  const renderDateInputBox = (
    value: string,
    onChange: (val: string) => void,
    label?: string,
    compact?: boolean
  ) => {
    return (
      <div className="w-full min-w-0">
        {label && (
          <label className={`block font-bold text-gray-700 dark:text-gray-300 ${compact ? 'text-[11px] mb-1' : 'text-[11px] mb-1.5'}`}>
            {label}
          </label>
        )}
        <div className="relative w-full min-w-0">
          {/* Custom Styled Display Box matching design: DD/MM/YYYY + Calendar icon */}
          <div className={`w-full ${compact ? 'h-10 px-3 rounded-xl text-xs' : 'h-11 px-3.5 rounded-xl text-xs sm:text-sm'} border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-between shadow-xs pointer-events-none`}>
            <span className="font-bold text-gray-800 dark:text-gray-100 truncate">
              {formatDDMMYYYY(value) || "ជ្រើសរើសថ្ងៃ"}
            </span>
            <Calendar size={compact ? 14 : 16} className="text-gray-400 dark:text-gray-300 shrink-0 ml-1.5" />
          </div>
          {/* Invisible Native Input Overlaid on Top so tapping anywhere opens native picker */}
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>
    );
  };

  // ==========================================
  // LEADERSHIP BUSINESS STATUS & DATE FILTER (ស្ថានភាពអាជីវកម្ម)
  // Matching user's specifications:
  // - 3 Tabs: ថ្ងៃ | ខែ | កំណត់ (no separate ឆ្នាំ tab)
  // - In Month tab: Month & Year dropdowns
  // - Alert banner if 0 transactions
  // - 4 Summary stat cards: លក់សរុប, អ្នកលក់ដែលបានលក់, ផលិតផលបានលក់, ថ្ងៃមានការលក់
  // ==========================================
  const renderLeadershipBusinessStatus = () => {
    return (
      <div className="space-y-3.5">
        {/* Leadership Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-0.5">
          <div>
            <p className="text-[11px] font-bold text-[#7b1e3a] dark:text-pink-400 tracking-wider uppercase">
              EMMI · LEADERSHIP
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
              ស្ថានភាពអាជីវកម្ម
            </h2>
          </div>
          <div className="self-start sm:self-auto px-3 py-1 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-xs flex items-center gap-1.5">
            <Calendar size={13} className="text-[#7b1e3a] dark:text-pink-400" />
            <span>{activeSalesDateRange.displayText}</span>
          </div>
        </div>

        {/* Date Filter Card with 3 Tabs: ថ្ងៃ | ខែ (រួមបញ្ចូលឆ្នាំ) | កំណត់ */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3.5 overflow-hidden">
          {/* Top 3 Tab Switcher */}
          <div className="p-1 rounded-2xl bg-gray-100 dark:bg-white/10 flex gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSalesFilterTab("day")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                salesFilterTab === "day"
                  ? "bg-[#7b1e3a] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              }`}
            >
              ថ្ងៃ
            </button>
            <button
              type="button"
              onClick={() => setSalesFilterTab("month")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                salesFilterTab === "month"
                  ? "bg-[#7b1e3a] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              }`}
            >
              ខែ
            </button>
            <button
              type="button"
              onClick={() => setSalesFilterTab("custom")}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                salesFilterTab === "custom"
                  ? "bg-[#7b1e3a] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              }`}
            >
              កំណត់
            </button>
          </div>

          {/* TAB 1: ថ្ងៃ (Day) */}
          {salesFilterTab === "day" && (
            <div className="space-y-3 animate-fadeIn">
              {renderDateInputBox(salesFilterDay, setSalesFilterDay, "ថ្ងៃ ខែ ឆ្នាំ")}

              {/* 2 Quick Presets: ថ្ងៃនេះ | ម្សិលមិញ */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSalesFilterDay(datesInfo.todayStr)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    salesFilterDay === datesInfo.todayStr
                      ? "bg-[#fbe9ee]/70 dark:bg-[#3e1321] border-[#7b1e3a] text-[#7b1e3a] dark:text-pink-300 shadow-xs"
                      : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                  }`}
                >
                  ថ្ងៃនេះ
                </button>
                <button
                  type="button"
                  onClick={() => setSalesFilterDay(datesInfo.yesterdayStr)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    salesFilterDay === datesInfo.yesterdayStr
                      ? "bg-[#fbe9ee]/70 dark:bg-[#3e1321] border-[#7b1e3a] text-[#7b1e3a] dark:text-pink-300 shadow-xs"
                      : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                  }`}
                >
                  ម្សិលមិញ
                </button>
              </div>

              <div className="text-[11px] text-gray-400 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-white/5">
                {formatDDMMYYYY(salesFilterDay)}
              </div>
            </div>
          )}

          {/* TAB 2: ខែ (Month + Year Dropdowns inside, exactly as user requested) */}
          {salesFilterTab === "month" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    ខែ
                  </label>
                  <select
                    value={salesFilterMonth}
                    onChange={(e) => setSalesFilterMonth(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a111a] text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                  >
                    {KHMER_MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    ឆ្នាំ
                  </label>
                  <select
                    value={salesFilterYear}
                    onChange={(e) => setSalesFilterYear(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a111a] text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                  >
                    {AVAILABLE_YEARS.map((y) => (
                      <option key={y} value={y}>
                        ឆ្នាំ {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-[11px] text-gray-400 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-white/5">
                {activeSalesDateRange.displayText}
              </div>
            </div>
          )}

          {/* TAB 3: កំណត់ (Custom Date Range) */}
          {salesFilterTab === "custom" && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="min-w-0">
                  {renderDateInputBox(salesFilterStartDate, setSalesFilterStartDate, "ចាប់ពីថ្ងៃ")}
                </div>

                <div className="min-w-0">
                  {renderDateInputBox(salesFilterEndDate, setSalesFilterEndDate, "ដល់ថ្ងៃ")}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-white/5">
                {activeSalesDateRange.displayText}
              </div>
            </div>
          )}
        </div>

        {/* Warning Banner if 0 transactions in filtered period */}
        {filteredSales.length === 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fadeIn">
            <span className="text-base">⚠️</span>
            <span>
              មិនមានប្រតិបត្តិការក្នុងរយៈពេល {activeSalesDateRange.displayText}។ សូមជ្រើសរើសថ្ងៃ ឬខែផ្សេង។
            </span>
          </div>
        )}

        {/* 4 Summary Stat Cards (សង្ខេបការលក់) */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Package size={17} className="text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              សង្ខេបការលក់
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* Card 1: លក់សរុប */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <TrendingUp size={15} />
                <span>លក់សរុប</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
                {salesSummaryStats.totalBoxes}{" "}
                <span className="text-xs font-bold text-gray-500">ប្រអប់</span>
              </p>
              <p className="text-[11px] text-gray-400">
                {salesSummaryStats.totalOrders} ប្រតិបត្តិការលក់
              </p>
            </div>

            {/* Card 2: អ្នកលក់ដែលបានលក់ */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                <User size={15} />
                <span>អ្នកលក់ដែលបានលក់</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
                {salesSummaryStats.activeSellersCount}{" "}
                <span className="text-xs font-bold text-gray-500">នាក់</span>
              </p>
              <p className="text-[11px] text-gray-400">
                ក្នុងរយៈពេលដែលជ្រើស
              </p>
            </div>

            {/* Card 3: ផលិតផលបានលក់ */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Package size={15} />
                <span>ផលិតផលបានលក់</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
                {salesSummaryStats.uniqueProductsCount}{" "}
                <span className="text-xs font-bold text-gray-500">មុខ</span>
              </p>
              <p className="text-[11px] text-gray-400">
                {salesSummaryStats.uniqueProductsCount > 0 ? "មុខទំនិញមានចលនា" : "មិនទាន់មានការលក់"}
              </p>
            </div>

            {/* Card 4: ថ្ងៃមានការលក់ */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Calendar size={15} />
                <span>ថ្ងៃមានការលក់</span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
                {salesSummaryStats.salesDaysCount}{" "}
                <span className="text-xs font-bold text-gray-500">ថ្ងៃ</span>
              </p>
              <p className="text-[11px] text-gray-400">
                នៃរយៈពេលដែលជ្រើស
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER: ADMIN EXECUTIVE COMMAND CENTER
  // 1. ការលក់ប្រចាំថ្ងៃ (Today, Yesterday, Month vs 500 Goal & 5/day Goal)
  // 2. អ្នកលក់បាន Follow Up ភ្ញៀវប៉ុន្មាន (Counts, Due, Overdue, Rate)
  // 3. របាយការណ៍អ្នកលក់ទម្លាក់បានធ្វើអ្វីខ្លះ (Reports, Activities, Missing Sellers)
  // 4. ដឹងថាអ្នកលក់បាន Follow Up មែនអត់? (Audit Trail & Proof from Google Sheets)
  // ==========================================
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-4 animate-fadeIn">
        {/* Admin Header with Mode Switcher */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#230c14] to-[#451221] text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                  🛡️ Admin Executive Mode
                </span>
                <span className="text-xs text-pink-200/80">{datesInfo.curMonthStr}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                ផ្ទាំងគ្រប់គ្រងទូទៅ Admin (Command Center)
              </h2>
              <p className="text-xs text-pink-200/80">
                ពិនិត្យមើលការលក់, វឌ្ឍនភាព Follow Up, របាយការណ៍សកម្មភាព និងភស្តុតាងជាក់ស្ដែងលើ Google Sheet
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setAdminViewMode("seller_preview")}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-pink-100 transition-all flex items-center gap-1.5 border border-white/15"
                title="មើលបែបផែនអេក្រង់អ្នកលក់"
              >
                <span>👁️ មើលជា Seller</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-pink-200 text-[11px]">📦 លក់ថ្ងៃនេះសរុប</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {datesInfo.todayBoxes > 0 ? datesInfo.todayBoxes : datesInfo.yesterdayBoxes}{" "}
                <span className="text-xs font-medium text-pink-200">ប្រអប់</span>
              </p>
              <p className="text-[10px] text-pink-200/70 mt-0.5">
                ម្សិលមិញ: {datesInfo.yesterdayBoxes} ប្រអប់
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-pink-200 text-[11px]">🎯 លក់ខែនេះ (តុលា)</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
                {datesInfo.monthBoxes}{" "}
                <span className="text-xs font-medium text-pink-200">/ 500</span>
              </p>
              <p className="text-[10px] text-pink-200/70 mt-0.5">
                សម្រេច {Math.round((datesInfo.monthBoxes / 500) * 100)}% នៃគោលដៅ
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-pink-200 text-[11px]">👥 Follow Up ថ្ងៃនេះ</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {customerCounts.today}{" "}
                <span className="text-xs font-medium text-pink-200">នាក់</span>
              </p>
              <p className="text-[10px] text-red-300 mt-0.5">
                ⚠️ ហួសថ្ងៃ: {customerCounts.overdue} នាក់
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-pink-200 text-[11px]">📝 Report ថ្ងៃនេះ</span>
              <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {adminSummary.totalReportsToday}{" "}
                <span className="text-xs font-medium text-pink-200">/ {adminSummary.totalSellers}</span>
              </p>
              <p className="text-[10px] text-amber-300 mt-0.5">
                {adminSummary.missingReportsSellers.length > 0
                  ? `នៅខ្វះ ${adminSummary.missingReportsSellers.length} នាក់`
                  : "✅ បានទម្លាក់គ្រប់គ្នា"}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Admin Tabs */}
        <div className="p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex flex-wrap sm:flex-nowrap gap-1.5 shadow-sm">
          <button
            onClick={() => setAdminSubTab("sales")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              adminSubTab === "sales"
                ? "bg-[#7b1e3a] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <Trophy size={15} />
            <span>១. ការលក់ប្រចាំថ្ងៃ</span>
          </button>

          <button
            onClick={() => setAdminSubTab("followups")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              adminSubTab === "followups"
                ? "bg-[#7b1e3a] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <Users size={15} />
            <span>២. តាមដាន Follow Up ({customerCounts.today})</span>
          </button>

          <button
            onClick={() => setAdminSubTab("reports")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              adminSubTab === "reports"
                ? "bg-[#7b1e3a] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <FileText size={15} />
            <span>៣. របាយការណ៍ & សកម្មភាព</span>
          </button>

          <button
            onClick={() => setAdminSubTab("proof")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              adminSubTab === "proof"
                ? "bg-[#7b1e3a] text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <ShieldCheck size={15} />
            <span>៤. ភស្តុតាង Follow Up ({followUpEvents.length})</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* SUBTAB 1: ការលក់ប្រចាំថ្ងៃ                            */}
        {/* ==================================================== */}
        {adminSubTab === "sales" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Leadership Business Status with 3-tab Date Filter (Day, Month+Year, Custom) & 4-Stat Sales Summary */}
            {renderLeadershipBusinessStatus()}

            {/* Team Goal 500 Boxes Banner */}
            <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                    <Target size={16} />
                    <span>គោលដៅលក់ប្រចាំខែរបស់ក្រុម: 500 ប្រអប់</span>
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    គោលដៅប្រចាំថ្ងៃម្នាក់ៗ 5 ប្រអប់ · លក់បានសរុបខែនេះ: {datesInfo.monthBoxes} ប្រអប់
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#7b1e3a] dark:text-pink-300">
                    {datesInfo.monthBoxes} / 500
                  </span>
                  <span className="text-xs font-bold text-gray-400 ml-1">
                    ({Math.round((datesInfo.monthBoxes / 500) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7b1e3a] to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.round((datesInfo.monthBoxes / 500) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 dark:border-white/5">
                <span>នៅខ្វះ {Math.max(0, 500 - datesInfo.monthBoxes)} ប្រអប់ទៀតដើម្បីសម្រេចគោលដៅក្រុម</span>
                <span>ខែមុន (កញ្ញា): 292 ប្រអប់</span>
              </div>
            </div>

            {/* Seller Sales Table & Cards */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  តារាងលទ្ធផលលក់តាមអ្នកលក់ ({adminSellerStats.length} នាក់)
                </h4>
                <span className="text-[11px] text-gray-400">គោលដៅ 5 ប្រអប់/ថ្ងៃ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminSellerStats.map((item) => {
                  const effectiveDaily = item.todaySales > 0 ? item.todaySales : item.yesterdaySales;
                  const dailyPercent = Math.min(100, Math.round((effectiveDaily / 5) * 100));
                  const isMet = effectiveDaily >= 5;

                  return (
                    <div
                      key={item.seller.id}
                      className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3 hover:border-[#7b1e3a] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#fbe9ee] dark:bg-[#3e1321] text-[#7b1e3a] dark:text-pink-300 font-black text-sm flex items-center justify-center">
                            {item.seller.initials}
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-[#230c14] dark:text-white">
                              {item.seller.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {item.seller.title} · គោលដៅខែ {item.monthGoal} ប្រអប់
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                            isMet
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {isMet ? "✅ គ្រប់គោលដៅ 5 ប្រអប់" : `⏳ ខ្វះ ${5 - effectiveDaily} ប្រអប់`}
                        </span>
                      </div>

                      {/* 3 Metric Pills */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ថ្ងៃនេះ</span>
                          <span className="text-sm font-black text-[#7b1e3a] dark:text-pink-300">
                            {item.todaySales}
                          </span>
                          <span className="text-[10px] text-gray-400"> / 5 ប្រអប់</span>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ម្សិលមិញ</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {item.yesterdaySales}
                          </span>
                          <span className="text-[10px] text-gray-400"> ប្រអប់</span>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ខែនេះ</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {item.monthSales}
                          </span>
                          <span className="text-[10px] text-gray-400"> ប្រអប់</span>
                        </div>
                      </div>

                      {/* Progress bar towards daily goal */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span>វឌ្ឍនភាពគោលដៅថ្ងៃនេះ</span>
                          <span>{dailyPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isMet ? "bg-emerald-500" : "bg-[#7b1e3a]"
                            }`}
                            style={{ width: `${dailyPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 2: តាមដាន FOLLOW UP តាមអ្នកលក់                */}
        {/* ==================================================== */}
        {adminSubTab === "followups" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header info */}
            <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                  <Clock size={16} />
                  <span>វឌ្ឍនភាព Follow Up តាមអ្នកលក់ម្នាក់ៗ</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  តាមដានចំនួនភ្ញៀវត្រូវ Follow Up ថ្ងៃនេះ, ភ្ញៀវហួសថ្ងៃ, និងភស្តុតាងដែលបានទាក់ទង
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-[#fbe9ee] text-[#7b1e3a] font-bold">
                  សរុបត្រូវ Follow ថ្ងៃនេះ: {customerCounts.today} នាក់
                </span>
              </div>
            </div>

            {/* Seller Follow-up Cards */}
            <div className="space-y-3">
              {adminSellerStats.map((item) => (
                <div
                  key={item.seller.id}
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7b1e3a] text-white font-black text-sm flex items-center justify-center shrink-0">
                        {item.seller.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#230c14] dark:text-white">
                          {item.seller.name}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          អតិថិជនសរុប {item.totalCust} នាក់ · បាន Follow Up រួច {item.followedUpCust} នាក់
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAdminSellerFilter(item.seller.name);
                          setActiveTab("customers");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-[#7b1e3a] hover:text-white text-xs font-bold transition-all text-gray-700 dark:text-gray-300 flex items-center gap-1"
                      >
                        <span>ពិនិត្យភ្ញៀវ ({item.totalCust})</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 4 Stat Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-center">
                      <span className="text-[10px] text-gray-400 block">អតិថិជនសរុប</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {item.totalCust} នាក់
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 text-center">
                      <span className="text-[10px] text-[#7b1e3a] dark:text-pink-300 font-bold block">
                        ត្រូវ Follow ថ្ងៃនេះ
                      </span>
                      <span className="text-sm font-black text-[#7b1e3a] dark:text-pink-300">
                        {item.dueTodayCust} នាក់
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-center">
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">
                        ⚠️ ហួសថ្ងៃ
                      </span>
                      <span className="text-sm font-black text-red-600 dark:text-red-400">
                        {item.overdueCust} នាក់
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-center">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                        ✅ បាន Follow Up
                      </span>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                        {item.followedUpCust} នាក់
                      </span>
                    </div>
                  </div>

                  {/* Completion and proof summary */}
                  <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>
                        ភស្តុតាង Follow Up ជាក់ស្ដែងលើ Google Sheet:{" "}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {item.todayEventsCount} ដងថ្ងៃនេះ
                        </strong>{" "}
                        (សរុប {item.sellerEventsCount} ដង)
                      </span>
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      អត្រាសម្រេច: {item.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 3: របាយការណ៍ & សកម្មភាព                        */}
        {/* ==================================================== */}
        {adminSubTab === "reports" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Submission Status & Alert Banner */}
            {adminSummary.missingReportsSellers.length > 0 ? (
              <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertCircle size={17} className="text-amber-600 shrink-0" />
                  <span>
                    ⚠️ អ្នកលក់មិនទាន់បានទម្លាក់ Daily Report ថ្ងៃនេះ ({adminSummary.missingReportsSellers.length} នាក់)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {adminSummary.missingReportsSellers.map((s) => (
                    <span
                      key={s.seller.id}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 border border-amber-300 dark:border-amber-700/50 text-xs font-bold text-amber-950 dark:text-amber-200 shadow-xs"
                    >
                      {s.seller.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>✅ អ្នកលក់ទាំងអស់បានទម្លាក់ Daily Report ថ្ងៃនេះរួចរាល់គ្រប់គ្នា!</span>
              </div>
            )}

            {/* List of Reports with Activities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  សកម្មភាពជាក់ស្ដែងដែលអ្នកលក់បានទម្លាក់ (សរុប {reports.length} របាយការណ៍)
                </h4>
                <span className="text-[11px] text-gray-400">ទាញយកពី Google Sheets</span>
              </div>

              {reports.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white dark:bg-white/5 border border-dashed border-gray-200 text-xs text-gray-400">
                  មិនទាន់មានរបាយការណ៍ត្រូវបានទម្លាក់ចូល Google Sheet នៅឡើយទេ
                </div>
              ) : (
                reports.map((r) => {
                  const u = ALL_USERS.find((x) => x.name.toLowerCase() === r.seller.toLowerCase());
                  const formattedTime = formatKhmerDateTime(r.submittedAt || r.date);

                  return (
                    <div
                      key={r.id}
                      className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#fbe9ee] text-[#7b1e3a] dark:bg-[#3e1321] dark:text-pink-300 font-black text-sm flex items-center justify-center">
                            {u?.initials || r.seller.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-[#230c14] dark:text-white">
                              {r.seller}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              កាលបរិច្ឆេទរបាយការណ៍: {r.date} · ម៉ោងទម្លាក់: {formattedTime}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold self-start sm:self-auto">
                          ✅ បានទម្លាក់រួច
                        </span>
                      </div>

                      {/* 4 Numbers Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ឆាតរកភ្ញៀវចាស់</span>
                          <span className="text-sm font-black text-gray-800 dark:text-white">
                            {r.chatGuests} នាក់
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ឆាតរកភ្ញៀវគោលដៅ</span>
                          <span className="text-sm font-black text-gray-800 dark:text-white">
                            {r.chatTarget} នាក់
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-[#7b1e3a] dark:text-pink-300">
                          <span className="text-[10px] block opacity-80">ចំនួនលក់បាន</span>
                          <span className="text-sm font-black">{r.soldCount} ប្រអប់</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                          <span className="text-[10px] text-gray-400 block">ប្រអប់ភ្ញៀវចាស់</span>
                          <span className="text-sm font-black text-gray-800 dark:text-white">
                            {r.oldCustomerBoxes} ប្រអប់
                          </span>
                        </div>
                      </div>

                      {/* Activities Highlight Box */}
                      <div className="p-3.5 rounded-2xl bg-[#fbe9ee]/70 dark:bg-white/5 border border-[#eadadd]/70 dark:border-white/10 space-y-1">
                        <p className="text-[11px] font-bold text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                          <FileText size={14} />
                          <span>សកម្មភាពជាក់ស្ដែងដែលបានធ្វើ (Activities):</span>
                        </p>
                        <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {r.activities ? r.activities : "មិនបានកត់ត្រាសកម្មភាពពិស្ដារទេ"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 4: ភស្តុតាង FOLLOW UP (AUDIT TRAIL)            */}
        {/* ==================================================== */}
        {adminSubTab === "proof" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Explanation Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#230c14] dark:text-white">
                    ភស្តុតាង Follow Up ជាក់ស្ដែង (Google Sheets 'FollowUpHistory')
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    ដឹងច្បាស់ថាតើអ្នកលក់ពិតជាបាន Follow Up ភ្ញៀវមែនអត់ តាមរយៈកំណត់ត្រាជាក់ស្ដែង ម៉ោង ខ្សែទូរសព្ទ និងកំណត់សម្គាល់
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកឈ្មោះភ្ញៀវ, លេខទូរសព្ទ, ឬកំណត់សម្គាល់..."
                  value={proofSearch}
                  onChange={(e) => setProofSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                />
              </div>

              <select
                value={proofSellerFilter}
                onChange={(e) => setProofSellerFilter(e.target.value)}
                className="h-10 px-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold outline-none"
              >
                <option value="all">អ្នកលក់ទាំងអស់ ({adminProofList.length})</option>
                {ALL_USERS.filter((u) => u.role === "seller").map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Trail List */}
            <div className="space-y-3">
              {adminProofList.length === 0 ? (
                <div className="p-8 text-center rounded-3xl bg-white dark:bg-white/5 border border-dashed border-gray-200 text-xs text-gray-400 space-y-1">
                  <p className="font-bold">មិនទាន់មានកំណត់ត្រា Follow Up នៅក្នុងការស្វែងរកនេះទេ</p>
                  <p className="text-[11px]">
                    រាល់ពេលអ្នកលក់ចុច "កត់ត្រាការ Follow Up" លើភ្ញៀវ ភស្តុតាងនឹងបង្ហាញនៅទីនេះភ្លាមៗ
                  </p>
                </div>
              ) : (
                adminProofList.map((item) => {
                  const formattedTime = formatKhmerDateTime(item.updatedAt || item.followUpDate);
                  const cleanPhone = item.phone.replace(/[^0-9+]/g, "");

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-2.5 hover:border-[#7b1e3a] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                            <Check size={12} />
                            <span>បាន Follow Up ពិតប្រាកដ</span>
                          </span>
                          <span className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300">
                            👤 {item.seller}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formattedTime}</span>
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {item.buyerName || "មិនទាន់មានឈ្មោះ"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>📞 {item.phone || "គ្មានលេខ"}</span>
                            <span>📍 {item.location || "មិនបញ្ជាក់"}</span>
                            <span>📦 {item.boxes} ប្រអប់</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {cleanPhone && cleanPhone.length >= 8 && (
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-xs hover:bg-emerald-100"
                            >
                              <Phone size={13} />
                              <span>តេទៅភ្ញៀវ</span>
                            </a>
                          )}
                          <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-medium">
                            {item.method || "តាមឆាត/តេ"}
                          </span>
                        </div>
                      </div>

                      {/* Note written by seller */}
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs space-y-0.5">
                        <span className="text-[10px] text-gray-400 font-bold block">
                          💬 កំណត់សម្គាល់ជាក់ស្ដែងពីការសន្ទនា:
                        </span>
                        <p className="text-gray-800 dark:text-gray-200">
                          {item.note ? item.note : "បានកត់ត្រាការ Follow Up (គ្មានកំណត់សម្គាល់បន្ថែម)"}
                        </p>
                      </div>

                      {item.nextFollowUp && (
                        <div className="text-[11px] text-gray-400">
                          🗓️ កាលបរិច្ឆេទ Follow Up លើកក្រោយ: <strong>{item.nextFollowUp}</strong>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER: RANKING LEADERBOARD (MATCHING USER REQUEST)
  // 1. Rank ផលិតផល និងគោលដៅប្រចាំថ្ងៃ/ខែ
  // 2. ចំណាត់ថ្នាក់ទម្លាក់ report (លឿនជាងគេ និងបានច្រើនជាងគេ)
  // ==========================================
  const renderRankingLeaderboard = () => {
    const periodLabel =
      rankingPeriod === "today"
        ? "ថ្ងៃនេះ"
        : rankingPeriod === "yesterday"
        ? "ម្សិលមិញ"
        : "ប្រចាំខែ";

    return (
      <div className="space-y-4">
        {/* Top Primary Switcher: Rank ផលិតផល VS ចំណាត់ថ្នាក់ Report */}
        <div className="p-1.5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex gap-2 shadow-sm">
          <button
            onClick={() => setRankingCategory("sales")}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              rankingCategory === "sales"
                ? "bg-[#7b1e3a] text-white shadow-md scale-[1.01]"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <Trophy size={16} />
            <span>Rank ផលិតផល & គោលដៅ</span>
          </button>
          <button
            onClick={() => setRankingCategory("reports")}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              rankingCategory === "reports"
                ? "bg-[#7b1e3a] text-white shadow-md scale-[1.01]"
                : "text-gray-600 dark:text-gray-300 hover:text-black"
            }`}
          >
            <FileText size={16} />
            <span>ចំណាត់ថ្នាក់ទម្លាក់ Report</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* CATEGORY 1: RANK ផលិតផល & គោលដៅ                      */}
        {/* ==================================================== */}
        {rankingCategory === "sales" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Leadership Business Status with 3-tab Date Filter & 4-Stat Sales Summary */}
            {renderLeadershipBusinessStatus()}

            {/* Section Header */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-base font-bold text-[#230c14] dark:text-white">
                ចំណាត់ថ្នាក់ · {activeSalesDateRange.displayText}
                <span className="text-xs font-normal text-gray-500 ml-2">
                  សរុប {salesSummaryStats.totalBoxes} ប្រអប់
                </span>
              </h3>
              <span className="text-xs px-3 py-1 rounded-full bg-[#fbe9ee] dark:bg-[#3e1321] text-[#7b1e3a] dark:text-pink-300 font-bold">
                {salesFilterTab === "day" ? "ប្រចាំថ្ងៃ" : salesFilterTab === "month" ? "ប្រចាំខែ" : "កំណត់កាលបរិច្ឆេទ"}
              </span>
            </div>

            {/* Olympic 3-Card Podium (matching Screenshot 1) */}
            {rankings.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 items-end pt-4 pb-2">
                {/* #2 Left */}
                <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-sky-100 dark:border-white/10 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#7b1e3a] font-bold text-sm flex items-center justify-center mx-auto mb-2 shadow-sm">
                    {rankings[1]?.initials}
                  </div>
                  <p className="text-xs font-bold truncate text-[#230c14] dark:text-white">
                    {rankings[1]?.name}
                  </p>
                  <p className="text-2xl font-black text-[#7b1e3a] dark:text-pink-400 mt-1">
                    {rankings[1]?.total}
                  </p>
                  <p className="text-[10px] text-gray-500">ប្រអប់</p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    លេខ 2
                  </span>
                </div>

                {/* #1 Center - Elevated with Gold Accent */}
                <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border-2 border-amber-400 dark:border-amber-500 shadow-md text-center transform -translate-y-2">
                  <div className="w-14 h-14 rounded-full bg-amber-400 text-white font-bold text-base flex items-center justify-center mx-auto mb-1.5 shadow-md">
                    {rankings[0]?.initials}
                  </div>
                  <div className="text-amber-500 flex justify-center mb-1">
                    <Award size={20} />
                  </div>
                  <p className="text-sm font-bold truncate text-[#230c14] dark:text-white">
                    {rankings[0]?.name}
                  </p>
                  <p className="text-3xl font-black text-[#7b1e3a] dark:text-pink-400 mt-1">
                    {rankings[0]?.total}
                  </p>
                  <p className="text-[10px] text-gray-500">ប្រអប់</p>
                  <span className="inline-block mt-2 px-3.5 py-0.5 rounded-full bg-[#fbe9ee] dark:bg-[#3e1321] text-xs font-bold text-[#7b1e3a] dark:text-pink-300">
                    លេខ 1
                  </span>
                </div>

                {/* #3 Right */}
                <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-amber-100 dark:border-white/10 shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#7b1e3a] font-bold text-sm flex items-center justify-center mx-auto mb-2 shadow-sm">
                    {rankings[2]?.initials}
                  </div>
                  <p className="text-xs font-bold truncate text-[#230c14] dark:text-white">
                    {rankings[2]?.name}
                  </p>
                  <p className="text-2xl font-black text-[#7b1e3a] dark:text-pink-400 mt-1">
                    {rankings[2]?.total}
                  </p>
                  <p className="text-[10px] text-gray-500">ប្រអប់</p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                    លេខ 3
                  </span>
                </div>
              </div>
            )}

            {/* Full Ranking List with Target Progress Bars (matching Screenshot 1) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                ចំណាត់ថ្នាក់ទាំងអស់ · {periodLabel}
              </p>

              {rankings.map((r, idx) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300 font-bold text-xs flex items-center justify-center shadow-sm">
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#230c14] dark:text-white">
                        {r.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-28 sm:w-48 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#7b1e3a] rounded-full transition-all"
                            style={{ width: `${r.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">
                          គោលដៅ {r.goal} {rankingPeriod === "today" || rankingPeriod === "yesterday" ? "ប្រអប់/ថ្ងៃ" : "ប្រអប់"} ({r.percent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-[#230c14] dark:text-white">
                      {r.total}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">ប្រអប់</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CATEGORY 2: ចំណាត់ថ្នាក់ទម្លាក់ REPORT                  */}
        {/* ==================================================== */}
        {rankingCategory === "reports" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#230c14] dark:text-white">
                  ចំណាត់ថ្នាក់ទម្លាក់ Daily Report
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  តាមដានវិន័យការងារ អ្នកណាទម្លាក់ report លឿនជាងគេ និងបានច្រើនជាងគេ។
                </p>
              </div>
              <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm flex items-center gap-1.5">
                <Calendar size={13} />
                <span>ថ្ងៃទី {reportRankings.targetDate}</span>
              </div>
            </div>

            {/* Sub-Filters: លឿនជាងគេ vs ច្រើនជាងគេ */}
            <div className="p-1.5 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex gap-1.5 shadow-sm max-w-md mx-auto sm:max-w-none">
              <button
                onClick={() => setReportRankType("fastest")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  reportRankType === "fastest"
                    ? "bg-[#7b1e3a] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-black"
                }`}
              >
                <span>⚡ ទម្លាក់លឿនជាងគេ</span>
              </button>
              <button
                onClick={() => setReportRankType("most")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  reportRankType === "most"
                    ? "bg-[#7b1e3a] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-black"
                }`}
              >
                <span>🔥 ទម្លាក់បានច្រើនជាងគេ</span>
              </button>
            </div>

            {/* VIEW 1: FASTEST SUBMISSION (លឿនជាងគេ) */}
            {reportRankType === "fastest" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Status Bar */}
                <div className="p-4 rounded-2xl bg-[#fbe9ee]/70 dark:bg-[#3e1321]/50 border border-[#7b1e3a]/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-[#7b1e3a] dark:text-pink-300">
                      របាយការណ៍ថ្ងៃ {reportRankings.targetDate}
                    </span>
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">
                    ទម្លាក់បាន {reportRankings.totalReported} / {reportRankings.totalSellers} នាក់
                  </span>
                </div>

                {/* Fastest Submissions Podium (if any) */}
                {reportRankings.fastestList.length > 0 ? (
                  <div className="space-y-3">
                    <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                        តារាងអ្នកទម្លាក់ Report លឿនជាងគេតាមម៉ោង ({reportRankings.targetDate})
                      </p>

                      {reportRankings.fastestList.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3.5">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                                idx === 0
                                  ? "bg-amber-400 text-white"
                                  : idx === 1
                                  ? "bg-gray-300 text-gray-800"
                                  : idx === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-gray-100 dark:bg-white/10 text-gray-500"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300 font-bold text-xs flex items-center justify-center shadow-sm">
                              {item.initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs sm:text-sm font-bold text-[#230c14] dark:text-white">
                                  {item.seller}
                                </p>
                                {idx === 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold flex items-center gap-1">
                                    ⚡ លឿនដាច់គេ
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                លក់បាន: <span className="font-bold text-[#7b1e3a] dark:text-pink-300">{item.soldCount} ប្រអប់</span>
                                {item.activities ? ` · "${item.activities}"` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {item.formattedTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pending Sellers */}
                    {reportRankings.pendingSellers.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                          <AlertCircle size={15} />
                          <span>អ្នកមិនទាន់បានទម្លាក់ Daily Report ({reportRankings.pendingSellers.length} នាក់)</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {reportRankings.pendingSellers.map((u) => (
                            <span
                              key={u.id}
                              className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-amber-200/60 shadow-xs"
                            >
                              ⏳ {u.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-white/5 rounded-3xl border border-[#eadadd] dark:border-white/10 text-xs text-gray-500">
                    ពុំទាន់មានអ្នកទម្លាក់ Daily Report សម្រាប់ថ្ងៃនេះនៅឡើយទេ
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: MOST REPORTS SUBMITTED (បានច្រើនជាងគេ) */}
            {reportRankType === "most" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                    ចំណាត់ថ្នាក់តាមចំនួនដងនៃការទម្លាក់ Report (វិន័យ និងភាពទៀងទាត់)
                  </p>

                  {reportRankings.mostList.map((r, idx) => {
                    const maxCount = Math.max(1, reportRankings.mostList[0]?.count || 1);
                    const percent = Math.round((r.count / maxCount) * 100);

                    return (
                      <div
                        key={r.name}
                        className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0"
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                              idx === 0
                                ? "bg-amber-400 text-white"
                                : idx === 1
                                ? "bg-gray-300 text-gray-800"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "bg-gray-100 dark:bg-white/10 text-gray-500"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300 font-bold text-xs flex items-center justify-center shadow-sm">
                            {r.initials}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-[#230c14] dark:text-white">
                              {r.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-24 sm:w-40 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-[#7b1e3a] rounded-full transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {r.lastDate ? `ចុងក្រោយ: ${r.lastDate}` : "មិនទាន់ទម្លាក់"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-[#7b1e3a] dark:text-pink-400">
                            {r.count}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">ដង</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // COMPONENT: AI CONSULTATION & DIFFICULT BUYER COACH
  // Helps sellers answer tough medical & buyer questions
  // ==========================================
  const renderAiSalesAssistant = () => {
    const activeCatObj =
      AI_CONSULTATION_CATEGORIES.find((c) => c.id === aiCategory) ||
      AI_CONSULTATION_CATEGORIES[0];

    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-pink-50/40 to-[#fbe9ee]/50 dark:from-[#2a111a] dark:via-[#32131f] dark:to-[#220d15] border border-pink-200/90 dark:border-pink-900/40 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7b1e3a] to-[#d6336c] text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
              <Bot size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>ជំនួយការ AI ប្រឹក្សា & ជួយឆ្លើយសំណួរពិបាកៗ</span>
                  <Sparkles size={15} className="text-amber-500" />
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[#7b1e3a] dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                  📖 សៀវភៅរោគស្ត្រី ១៧ មេរៀន (អគ្គនាយក វណ្ណ ស៊ីថា)
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                «អ្នកលក់ឆ្នើម គឺជាអ្នកលក់ដែលមានជំនាញក្នុងវិស័យដែលខ្លួនលក់» • ពេលពិបាកឆ្លើយជាមួយភ្ញៀវ គ្រាន់តែចុចជ្រើសរើស ឬ Paste សំណួរភ្ញៀវចូលទីនេះ
              </p>
            </div>
          </div>
          {(aiResult || aiStructured) && (
            <button
              onClick={() => {
                setAiResult("");
                setAiStructured(null);
                setAiPrompt("");
              }}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all shrink-0 cursor-pointer"
              title="លុបចោលដើម្បីសួរថ្មី"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {AI_CONSULTATION_CATEGORIES.map((cat) => {
              const isSelected = aiCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAiCategory(cat.id)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#7b1e3a] text-white border-[#7b1e3a] shadow-xs"
                      : "bg-white/90 dark:bg-white/5 text-gray-700 dark:text-gray-200 border-pink-100 dark:border-white/10 hover:bg-pink-50 dark:hover:bg-white/10"
                  }`}
                >
                  <p className="text-xs font-bold truncate">{cat.label}</p>
                  <p
                    className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? "text-pink-100" : "text-gray-400 dark:text-gray-400"
                    }`}
                  >
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Scenarios inside active category */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-pink-100/90 dark:border-white/10">
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              <HeartPulse size={12} className="text-[#7b1e3a] dark:text-pink-400" />
              <span>សំណួរដែលអ្នកលក់ឧស្សាហ៍ពិបាកឆ្លើយ ({activeCatObj.label}) — ចុចជ្រើសរើស៖</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activeCatObj.scenarios.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskAi(sc.prompt)}
                  disabled={aiLoading}
                  className="px-2.5 py-1.5 rounded-xl bg-[#fbe9ee]/70 dark:bg-pink-950/40 hover:bg-[#7b1e3a] hover:text-white text-gray-800 dark:text-gray-100 text-xs font-semibold border border-pink-200/80 dark:border-pink-800/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Textarea & Ask Button */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="កន្លែងជួយអ្នកលក់៖ វាយសំណួរដែលភ្ញៀវសួរ ឬ Copy សារភ្ញៀវពីក្នុង Chat មកដាក់ទីនេះ... (ឧ. ភ្ញៀវសួរថា មានគីសស្បូនញ៉ាំ Emmi បានអត់? ឬ ភ្ញៀវញ៉ាំបាន ៤ថ្ងៃធ្លាក់សច្រើនជាងមុន...)"
              className="w-full p-3 pr-8 rounded-2xl border border-pink-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs sm:text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a] shadow-xs resize-none"
            />
            {aiPrompt && (
              <button
                type="button"
                onClick={() => setAiPrompt("")}
                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs px-1.5 py-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              💡 AI នឹងពន្យល់អ្នកលក់ + បង្កើតសារឆ្លើយតបឱ្យ Copy ផ្ញើទៅភ្ញៀវភ្លាមៗ
            </span>
            <button
              type="button"
              onClick={() => handleAskAi()}
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7b1e3a] to-[#d6336c] hover:from-[#66162e] hover:to-[#b82658] active:scale-95 text-white text-xs font-bold shadow-md shadow-pink-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto"
            >
              {aiLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>កំពុងរៀបចំចម្លើយជូនអ្នកលក់...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>ឱ្យ AI ជួយឆ្លើយភ្ញៀវ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {aiError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Structured AI Result Cards */}
        {aiStructured ? (
          <div className="space-y-3 animate-fadeIn">
            {/* 1. Seller Coaching (For Seller's Eyes) */}
            {aiStructured.sellerCoaching && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-black text-xs">
                  <span>🧠 ការណែនាំសម្រាប់អ្នកលក់ (អានដើម្បីយល់ពីបញ្ហាភ្ញៀវ)៖</span>
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed whitespace-pre-wrap">
                  {aiStructured.sellerCoaching}
                </p>
              </div>
            )}

            {/* 2. Short & Sweet Reply (Direct Copy for Buyer) */}
            {aiStructured.shortReply && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f0b13] border-2 border-emerald-300 dark:border-emerald-800/70 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>💬 ជម្រើសទី ១៖ សារឆ្លើយតបខ្លី ងាយយល់ (ផ្ញើទៅភ្ញៀវ)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAiPart(aiStructured.shortReply, "short")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      aiCopiedKey === "short"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    }`}
                  >
                    {aiCopiedKey === "short" ? (
                      <>
                        <Check size={13} />
                        <span>បាន Copy រួចរាល់!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy សារខ្លីនេះផ្ញើទៅភ្ញៀវ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {aiStructured.shortReply}
                </p>
              </div>
            )}

            {/* 3. Detailed Expert Reply (Direct Copy for Buyer) */}
            {aiStructured.detailedReply && (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1f0b13] border-2 border-pink-300 dark:border-pink-800/70 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-xs font-black text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                    <span>🌟 ជម្រើសទី ២៖ សារពន្យល់លម្អិតបែបអ្នកជំនាញ & បិទការលក់</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAiPart(aiStructured.detailedReply, "detailed")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      aiCopiedKey === "detailed"
                        ? "bg-emerald-600 text-white"
                        : "bg-[#7b1e3a] hover:bg-[#66162e] text-white shadow-xs"
                    }`}
                  >
                    {aiCopiedKey === "detailed" ? (
                      <>
                        <Check size={13} />
                        <span>បាន Copy រួចរាល់!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy សារលម្អិតនេះផ្ញើទៅភ្ញៀវ</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {aiStructured.detailedReply}
                </p>
              </div>
            )}

            {/* 4. Follow-Up Hook Question */}
            {aiStructured.followUpHook && (
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black text-purple-900 dark:text-purple-300">
                    🎯 សំណួរសួរបន្តកុំឱ្យភ្ញៀវស្ងាត់ (Follow-Up Hook)៖
                  </p>
                  <p className="text-xs text-purple-950 dark:text-purple-100 font-medium">
                    {aiStructured.followUpHook}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAiPart(aiStructured.followUpHook, "hook")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shrink-0 self-start sm:self-center cursor-pointer"
                >
                  {aiCopiedKey === "hook" ? (
                    <>
                      <Check size={13} />
                      <span>បាន Copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy សំណួរនេះ</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : aiResult ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1f0b13] border border-pink-200/90 dark:border-pink-900/40 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-xs font-black text-[#7b1e3a] dark:text-pink-300">
                💬 ចម្លើយពី AI៖
              </span>
              <button
                type="button"
                onClick={() => handleCopyAiPart(aiResult, "raw")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7b1e3a] text-white cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy សារ</span>
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {aiResult}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // ==========================================
  // TAB: NATIVE IN-APP ORDER FORM (ទម្រង់កុម្មង់ទំនិញ VST)
  // Submits directly into Google Form -> Google Sheet
  // ==========================================
  const renderOrderTab = () => {
    return (
      <div className="space-y-3 animate-fadeIn pb-10">
        {/* Compact Header Banner */}
        <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#7b1e3a] via-[#8c2242] to-[#6b1830] text-white shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ShoppingBag size={16} className="text-pink-100" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-black text-white leading-tight">ទម្រង់កុម្មង់ទំនិញ VST</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-400/25 text-amber-200 border border-amber-300/30">
                  ⭐ {orderTeam}
                </span>
              </div>
              <p className="text-[10px] text-pink-200/90 leading-tight truncate mt-0.5">
                កត់ត្រាចូល Google Sheet ស្តង់ដាស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <a
            href={ORDER_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-all shrink-0 cursor-pointer"
            title="បើកមើល Google Form ដើម"
          >
            <span>Form ដើម</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Success Alert */}
        {orderSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-xs">✅ បានបញ្ជូនការកុម្ម៉ង់ដោយជោគជ័យ!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                ទិន្នន័យបានកត់ត្រាចូល Google Sheet រួចរាល់។
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {orderError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 shadow-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-xs">❌ មិនអាចបញ្ជូនបាន</p>
              <p className="text-[11px] text-red-700 dark:text-red-300">{orderError}</p>
            </div>
          </div>
        )}

        {/* Compact Form */}
        <form onSubmit={handleSubmitOrder} className="space-y-3">
          {/* Card 1: ព័ត៌មានអ្នកលក់ & កាលបរិច្ឆេទ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#2a111a] border border-[#eadadd] dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-white/5">
              <User size={14} className="text-[#7b1e3a] dark:text-pink-400" />
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-100">
                ព័ត៌មានអ្នកលក់ និងកាលបរិច្ឆេទ
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Question 1: Date */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ១. កាលបរិច្ឆេទ(Date) <span className="text-red-500">*</span>
                </label>
                {renderDateInputBox(orderDate, setOrderDate, undefined, true)}
              </div>

              {/* Question 2: Team */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ២. ថ្នាក់ដឹកនាំ(Team) <span className="text-red-500">*</span>
                </label>
                <select
                  value={orderTeam}
                  onChange={(e) => setOrderTeam(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                >
                  {TEAM_OPTIONS.map((t) => (
                    <option key={t} value={t} className="text-gray-900 dark:text-white">
                      {t === "Vann_Sitha" ? `⭐ ${t} (Default)` : t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question 3: Seller Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ៣. ឈ្មោះអ្នកលក់ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderSellerName}
                  onChange={(e) => setOrderSellerName(e.target.value)}
                  placeholder="វាយឈ្មោះអ្នកលក់..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                />
              </div>

              {/* Question 4: Seller No */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ៤. លេខអ្នកលក់(Seller No)
                </label>
                <input
                  type="text"
                  value={orderSellerNo}
                  onChange={(e) => setOrderSellerNo(e.target.value)}
                  placeholder="លេខទូរស័ព្ទ ឬកូដអ្នកលក់"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: ព័ត៌មានទំនិញ & តម្លៃ */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#2a111a] border border-[#eadadd] dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-[#7b1e3a] dark:text-pink-400" />
                <h3 className="text-xs font-black text-gray-800 dark:text-gray-100">
                  មុខទំនិញ និងតម្លៃ
                </h3>
              </div>
              <span className="text-[11px] font-black text-[#7b1e3a] dark:text-pink-400">
                {orderProductName} × {orderProductQty} ប្រអប់
              </span>
            </div>

            {/* Question 5: Product Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                ៥. រើសមុខផលិតផល (Product) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRODUCT_OPTIONS.map((prod) => {
                  const isSelected = orderProductName === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setOrderProductName(prod.id)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#7b1e3a] bg-[#7b1e3a]/10 dark:bg-[#7b1e3a]/30 shadow-xs ring-1.5 ring-[#7b1e3a]"
                          : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          {prod.name}
                        </span>
                        {isSelected && <Check size={13} className="text-[#7b1e3a] dark:text-pink-400 font-bold" />}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {prod.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                ចំនួនប្រអប់ (Quantity) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setOrderProductQty(qty)}
                    className={`h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                      orderProductQty === qty
                        ? "bg-[#7b1e3a] text-white shadow-xs ring-2 ring-[#7b1e3a]/30 scale-102"
                        : "bg-gray-50 dark:bg-[#341420] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-100"
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 6: Price */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                ៦. តម្លៃ(Price) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                placeholder="វាយតម្លៃលក់ (ឧ. 25$)"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
              />
            </div>
          </div>

          {/* Card 3: ព័ត៌មានអ្នកទទួល & ដឹកជញ្ជូន */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#2a111a] border border-[#eadadd] dark:border-white/10 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-gray-100 dark:border-white/5">
              <MapPin size={14} className="text-[#7b1e3a] dark:text-pink-400" />
              <h3 className="text-xs font-black text-gray-800 dark:text-gray-100">
                ព័ត៌មានអ្នកទទួល និងការដឹកជញ្ជូន
              </h3>
            </div>

            {/* Row 1: Receiver Phone & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Question 7: Receiver Phone */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ៧. លេខអ្នកទទួល(Receiver No) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={14} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={orderReceiverPhone}
                    onChange={(e) => setOrderReceiverPhone(e.target.value)}
                    placeholder="លេខទូរស័ព្ទ (ឧ. 0976818615)"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                  />
                </div>
              </div>

              {/* Question 8: Recipient Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ៨. ឈ្មោះអ្នកទទួល(Recipient)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    value={orderReceiverName}
                    onChange={(e) => setOrderReceiverName(e.target.value)}
                    placeholder="ឈ្មោះអ្នកទទួល (ប្រសិនបើមាន)"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                  />
                </div>
              </div>
            </div>

            {/* Question 9: Address */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                ៩. អាសយដ្ឋាន(Address) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3 flex items-start pointer-events-none text-gray-400">
                  <MapPin size={14} />
                </div>
                <textarea
                  required
                  rows={2}
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  placeholder="ផ្ទះលេខ... ផ្លូវ... ឃុំ/សង្កាត់... ស្រុក/ខណ្ឌ... ខេត្ត/រាជធានី..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
                />
              </div>
            </div>

            {/* Question 10: Delivery */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                ១០. ដឹកជញ្ជូនតាម(Delivery) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DELIVERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOrderDelivery(opt.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      orderDelivery === opt.id
                        ? "border-[#7b1e3a] bg-[#7b1e3a]/10 dark:bg-[#7b1e3a]/30 ring-1.5 ring-[#7b1e3a]"
                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-800 dark:text-gray-100 truncate">
                        {opt.id}
                      </span>
                      {orderDelivery === opt.id && (
                        <Check size={13} className="text-[#7b1e3a] dark:text-pink-400 font-bold shrink-0 ml-1" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 11: Note */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                ១១. ចំណាំ(Note)
              </label>
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="ចំណាំបន្ថែមសម្រាប់ទំនិញ ឬការដឹកជញ្ជូន..."
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#341420] text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#7b1e3a]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7b1e3a] to-[#9c254d] hover:from-[#66162e] hover:to-[#851c3f] active:scale-98 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submittingOrder ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>កំពុងបញ្ជូន...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>បញ្ជូនការកុម្ម៉ង់ (Submit)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // ==========================================
  // RENDER: MAIN APPLICATION (Logged In)

  // ==========================================
  // RENDER: MAIN APPLICATION (Logged In)
  // Responsive: Max-width 5xl on desktop, full on mobile!
  // ==========================================
  return (
    <div className="min-h-screen bg-[#fcf8f9] dark:bg-[#1c0a10] text-[#230c14] dark:text-[#fcf4f6] font-khmer flex justify-center selection:bg-[#7b1e3a] selection:text-white">
      {/* Mobile Drawer (matching user screenshot 2) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-[285px] max-w-[85%] h-full bg-[#3e1321] text-white p-5 flex flex-col justify-between shadow-2xl z-10 animate-drawer overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 shadow-xs">
                    <img src="/emmi-logo.png" alt="EMMI" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">EMMI</h3>
                    <p className="text-[10px] text-pink-200/70">SALES CRM</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Standardized Settings Panel: Theme, Language, Font Size */}
              <div className="my-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs">
                  <span className="font-bold text-pink-200">{language === "en" ? "Settings" : "ការកំណត់ប្រព័ន្ធ"}</span>
                  <span className="text-[10px] text-pink-300/70">{language === "en" ? "Preferences" : "ស្តង់ដា"}</span>
                </div>

                {/* 1. Theme Mode (Dark / Light) */}
                <div className="space-y-1">
                  <span className="text-[11px] text-pink-200/80 block">
                    {language === "en" ? "🎨 Theme" : "🎨 ផ្ទៃអេក្រង់"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        !darkMode
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Sun size={14} />
                      <span>{language === "en" ? "Light" : "ពន្លឺ"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        darkMode
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Moon size={14} />
                      <span>{language === "en" ? "Dark" : "ងងឹត"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Language Switcher (ប្តូរភាសា) */}
                <div className="space-y-1">
                  <span className="text-[11px] text-pink-200/80 block">
                    {language === "en" ? "🌐 Language" : "🌐 ប្តូរភាសា"}
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("km")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        language === "km"
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <span>🇰🇭</span>
                      <span>ខ្មែរ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange("en")}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        language === "en"
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>English</span>
                    </button>
                  </div>
                </div>

                {/* 3. Standardized Font Size Selector (ជ្រើសទំហំអក្សរ) */}
                <div className="space-y-1">
                  <span className="text-[11px] text-pink-200/80 block">
                    {language === "en" ? "🔤 Font Size" : "🔤 ទំហំអក្សរ"}
                  </span>
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/20 border border-white/10 text-center">
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange("sm")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        fontSize === "sm"
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                      title="Compact font"
                    >
                      <span className="text-[11px]">A⁻</span>
                      <span className="text-[9px] opacity-80">{language === "en" ? "Small" : "តូច"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange("md")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        fontSize === "md"
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                      title="Standard font"
                    >
                      <span className="text-xs">A</span>
                      <span className="text-[9px] opacity-80">{language === "en" ? "Normal" : "ស្តង់ដា"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFontSizeChange("lg")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center ${
                        fontSize === "lg"
                          ? "bg-white text-[#7b1e3a] shadow-sm"
                          : "text-white/70 hover:text-white"
                      }`}
                      title="Large font"
                    >
                      <span className="text-sm">A⁺</span>
                      <span className="text-[9px] opacity-80">{language === "en" ? "Large" : "ធំ"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Menu Items */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === "dashboard"
                      ? "bg-white text-[#7b1e3a] font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <LayoutGrid size={18} />
                  <span>
                    {language === "en"
                      ? currentRole === "admin"
                        ? "Admin Dashboard"
                        : "Home Dashboard"
                      : currentRole === "admin"
                      ? "ផ្ទាំងបញ្ជា Admin"
                      : "ទំព័រដើម"}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("customers");
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === "customers"
                      ? "bg-white text-[#7b1e3a] font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Users size={18} />
                    <span>{language === "en" ? "Customers List" : "បញ្ជីអតិថិជន"}</span>
                  </div>
                  {customerCounts.today > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  )}
                </button>

                <a
                  href={ORDER_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm text-white/80 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span>{language === "en" ? "Place Order" : "កុម្ម៉ង់ទំនិញ"}</span>
                  <ExternalLink size={14} className="ml-auto opacity-60" />
                </a>

                <button
                  onClick={() => {
                    setActiveTab("reports");
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === "reports"
                      ? "bg-white text-[#7b1e3a] font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <FileText size={18} />
                  <span>{language === "en" ? "Daily Reports" : "របាយការណ៍ប្រចាំថ្ងៃ"}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("ranking");
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === "ranking"
                      ? "bg-white text-[#7b1e3a] font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Trophy size={18} />
                  <span>{language === "en" ? "Sales Ranking" : "ចំណាត់ថ្នាក់អ្នកលក់"}</span>
                </button>
              </nav>
            </div>

            {/* Drawer Logout */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-pink-200/90 hover:bg-white/10 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>
                  {language === "en" ? "Sign Out" : "ចាកចេញ"} ({currentRole})
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Wide Max-W-5XL on Desktop, Responsive Mobile-first */}
      <div className="w-full max-w-5xl min-h-screen flex flex-col pb-36 sm:pb-40 mx-auto px-3 sm:px-6 relative">
        {/* Floating Toast Notification for instant smooth feedback */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#7b1e3a] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn border border-white/20">
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top App Header */}
        <header className="sticky top-0 z-30 bg-[#fcf8f9]/95 dark:bg-[#1c0a10]/95 backdrop-blur-md py-3 border-b border-[#eadadd]/60 dark:border-white/10 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex items-center justify-center text-[#7b1e3a] dark:text-pink-300 shadow-sm"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-pink-200 dark:border-white/20">
                <img src="/emmi-logo.png" alt="EMMI" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#a62b4e] uppercase tracking-wider">
                  EMMI SALES CRM
                </p>
                <p className="text-xs font-black text-[#230c14] dark:text-white">
                  {activeTab === "dashboard"
                    ? currentRole === "admin"
                      ? "ផ្ទាំងគ្រប់គ្រង Admin"
                      : "ទំព័រដើម"
                    : activeTab === "ranking"
                    ? "ចំណាត់ថ្នាក់"
                    : activeTab === "customers"
                    ? "បញ្ជីអតិថិជន"
                    : "របាយការណ៍"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm"
              title="ទាញយកទិន្នន័យថ្មី"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-[#7b1e3a]" : ""} />
            </button>

            <div className="h-9 px-3 rounded-xl bg-[#fbe9ee] dark:bg-[#3e1321] border border-[#7b1e3a]/20 flex items-center gap-2 text-xs font-bold text-[#7b1e3a] dark:text-pink-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{currentUser}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 space-y-4 py-2">
          {/* ==================================================== */}
          {/* TAB 1: DASHBOARD (ទំព័រដើម / ផ្ទាំងគ្រប់គ្រង ADMIN)   */}
          {/* ==================================================== */}
          {activeTab === "dashboard" && (
            currentRole === "admin" && adminViewMode === "admin" ? (
              renderAdminDashboard()
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {currentRole === "admin" && (
                  <div className="p-3.5 rounded-2xl bg-[#7b1e3a] text-white flex items-center justify-between shadow-md">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <span>👁️</span>
                      <span>កំពុងមើលបែបផែនអេក្រង់របស់អ្នកលក់ (Seller Preview Mode)</span>
                    </span>
                    <button
                      onClick={() => setAdminViewMode("admin")}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#7b1e3a] text-xs font-bold shadow-xs hover:bg-pink-50 transition-all"
                    >
                      ← ត្រឡប់ទៅផ្ទាំងបញ្ជា Admin
                    </button>
                  </div>
                )}

                {/* 1. Weekly Reminders (សកម្មភាព និងសាររំលឹកប្រចាំសប្ដាហ៍) - ON THE VERY TOP AS REQUESTED */}
                <div className="p-4 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                    <Target size={15} />
                    <span>សកម្មភាព និងសាររំលឹកប្រចាំសប្ដាហ៍</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">គោលការណ៍ EMMI</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 mb-0.5">១. វិន័យ</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">ទម្លាក់ Daily Report រៀងរាល់ល្ងាច</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 mb-0.5">២. ការបិទការលក់</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">ឆាតរកភ្ញៀវចាស់ និងភ្ញៀវគោលដៅ</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 mb-0.5">៣. ទម្លាប់</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">Follow Up ៧ថ្ងៃម្តង មិនអោយខកខាន</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 mb-0.5">៤. ផ្នត់គំនិត</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">ជួយដោះស្រាយបញ្ហាភ្ញៀវដោយស្មោះ</p>
                  </div>
                </div>
              </div>

              {/* 2. EMMI AI Sales & Gynecologist Specialist */}
              {renderAiSalesAssistant()}

              {/* 4. Action Shortcut Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Shortcut 1: Today Follow-Up */}
                <div
                  onClick={() => {
                    setActiveTab("customers");
                    setCustomerFilterTab("today_followup");
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#7b1e3a] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-[#7b1e3a] dark:text-pink-300 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#230c14] dark:text-white">
                        ត្រូវ Follow Up ថ្ងៃនេះ ({customerCounts.today} នាក់)
                      </h4>
                      <p className="text-[11px] text-gray-500">គិតតាម ៧ថ្ងៃ + ជិតអស់</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 shrink-0" />
                </div>

                {/* Shortcut 2: Overdue */}
                <div
                  onClick={() => {
                    setActiveTab("customers");
                    setCustomerFilterTab("overdue");
                  }}
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-red-200 dark:border-red-900/40 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-500 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400">
                        ⚠️ ហួសថ្ងៃ ({customerCounts.overdue} នាក់)
                      </h4>
                      <p className="text-[11px] text-gray-500">ហួសថ្ងៃកំណត់ follow-up</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 shrink-0" />
                </div>

                {/* Shortcut 3: Daily Report */}
                <div
                  onClick={() => setActiveTab("reports")}
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#7b1e3a] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-[#7b1e3a] dark:text-pink-300 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#230c14] dark:text-white">
                        របាយការណ៍ថ្ងៃនេះ ({datesInfo.todayStr})
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {todayMyReport ? "✅ បានបំពេញរួច" : "⚠️ មិនទាន់បានបំពេញ Daily Report ទេ"}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-[#7b1e3a] text-white text-xs font-bold shadow-sm shrink-0">
                    {todayMyReport ? "មើល" : "បំពេញ"}
                  </button>
                </div>
              </div>

              {/* 4. Team Summary & Leaderboard Link Card */}
              <div
                onClick={() => setActiveTab("ranking")}
                className="p-5 rounded-3xl bg-gradient-to-r from-[#7b1e3a] to-[#a62b4e] text-white shadow-lg cursor-pointer hover:shadow-xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      <span>ចំណាត់ថ្នាក់អ្នកលក់ & ទម្លាក់ Report</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                        ថ្មី
                      </span>
                    </h3>
                    <p className="text-xs text-pink-100 mt-0.5">
                      មើល Rank ផលិតផល (គោលដៅ 500 ប្រអប់) និងអ្នកទម្លាក់ Report លឿនជាងគេ →
                    </p>
                  </div>
                </div>
                <ChevronRight size={22} className="text-white/80 shrink-0" />
              </div>

              {/* 5. Interactive Seller Skill Quiz (តេស្តសាកល្បងសមត្ថភាពអ្នកលក់ ៤ ជម្រើស មិនជាន់គ្នា + ដាក់ពិន្ទុ) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-4">
                {/* Quiz Header & Scoreboard */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100 dark:border-white/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-[#230c14] dark:text-white flex items-center gap-1.5">
                        <Award size={17} className="text-[#7b1e3a] dark:text-pink-300" />
                        <span>តេស្តសាកល្បងសមត្ថភាពអ្នកលក់ (៤ ជម្រើស)</span>
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        ♾️ សំណួរឆ្លាស់គ្នាគ្មានដែនកំណត់ • មិនជាន់គ្នា
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      វាស់ស្ទង់ចំណេះដឹងពី «សៀវភៅ រោគស្ត្រី ទាំង ១៧ មេរៀន» (AI បង្កើតសំណួរថ្មីៗឆ្លាស់គ្នាដោយស្វ័យប្រវត្តិ) • ឆ្លើយត្រូវ +10 ពិន្ទុ
                    </p>
                  </div>

                  {/* Score Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-[#fbe9ee] dark:bg-[#3e1321] border border-[#7b1e3a]/20 text-xs font-black text-[#7b1e3a] dark:text-pink-200 flex items-center gap-1">
                      <Trophy size={13} className="text-amber-500" />
                      <span>ពិន្ទុ៖ {quizScore}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      ✅ ត្រូវ {quizCorrectCount}/{quizAnsweredCount}
                    </div>
                    {quizStreak > 1 && (
                      <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs font-bold text-amber-700 dark:text-amber-300">
                        🔥 {quizStreak} ជាប់គ្នា
                      </div>
                    )}
                    {quizAnsweredCount > 0 && (
                      <button
                        type="button"
                        onClick={handleResetQuizScore}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                        title="កំណត់ពិន្ទុឡើងវិញ"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#fcf8f9] to-[#fbe9ee]/50 dark:from-white/5 dark:to-white/10 border border-pink-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#7b1e3a] text-white">
                      📖 {quizCurrent.lesson}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      សំណួរទី #{quizAnsweredCount + (quizSelectedIdx !== null ? 0 : 1)} {quizPrefetching ? "• ✨ កំពុងបង្កើតសំណួរថ្មីបន្ថែម..." : "• 🔀 ឆ្លាស់មេរៀន"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#230c14] dark:text-white leading-relaxed pt-1">
                    {quizCurrent.question}
                  </p>
                </div>

                {/* 4 Answer Options (ក, ខ, គ, ឃ) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quizCurrent.options.map((optText, idx) => {
                    const khmerLetters = ["ក", "ខ", "គ", "ឃ"];
                    const isAnswered = quizSelectedIdx !== null;
                    const isSelected = quizSelectedIdx === idx;
                    const isCorrectOption = idx === quizCurrent.correctIndex;

                    let btnStyle =
                      "bg-gray-50/90 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:border-[#7b1e3a] hover:bg-[#fbe9ee]/40";
                    let badgeStyle =
                      "bg-white dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300 border border-pink-200 dark:border-white/10";

                    if (isAnswered) {
                      if (isCorrectOption) {
                        btnStyle =
                          "bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs";
                        badgeStyle = "bg-emerald-600 text-white";
                      } else if (isSelected && !isCorrectOption) {
                        btnStyle =
                          "bg-red-50 dark:bg-red-950/50 border-2 border-red-400 text-red-950 dark:text-red-100";
                        badgeStyle = "bg-red-600 text-white";
                      } else {
                        btnStyle =
                          "bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer disabled:cursor-default ${btnStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${badgeStyle}`}
                        >
                          {isAnswered && isCorrectOption
                            ? "✓"
                            : isAnswered && isSelected && !isCorrectOption
                            ? "✕"
                            : khmerLetters[idx]}
                        </span>
                        <span className="text-xs font-semibold leading-relaxed flex-1">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Result Explanation & Next Non-Repeating Question Button */}
                {quizSelectedIdx !== null ? (
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2.5 animate-fadeIn ${
                      quizSelectedIdx === quizCurrent.correctIndex
                        ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-xs font-black ${
                          quizSelectedIdx === quizCurrent.correctIndex
                            ? "text-emerald-800 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {quizSelectedIdx === quizCurrent.correctIndex
                          ? "🎉 អបអរសាទរ! ចម្លើយត្រឹមត្រូវ (+10 ពិន្ទុ)"
                          : "❌ ចម្លើយមិនត្រឹមត្រូវទេ! សូមអានការពន្យល់ខាងក្រោម៖"}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextQuizQuestion}
                        className="px-4 py-2 rounded-xl bg-[#7b1e3a] hover:bg-[#66162e] active:scale-95 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <span>សំណួរបន្ទាប់ (មិនជាន់គ្នា)</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                      💡 <strong>ការពន្យល់៖</strong> {quizCurrent.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                    <span>👆 សូមចុចជ្រើសរើសចម្លើយ ក, ខ, គ ឬ ឃ ខាងលើដើម្បីទទួលបានពិន្ទុ</span>
                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>ប្តូរសំណួរផ្សេង</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ==================================================== */}
          {/* TAB 5: RANKING (ចំណាត់ថ្នាក់ - Pure View Matching Pic 1) */}
          {/* ==================================================== */}
          {activeTab === "ranking" && (
            <div className="space-y-4 animate-fadeIn">
              {renderRankingLeaderboard()}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: CUSTOMERS FOLLOW-UP                           */}
          {/* ==================================================== */}
          {activeTab === "customers" && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* 1. Weekly Reminders (សកម្មភាព និងសាររំលឹកប្រចាំសប្ដាហ៍) - ON TOP OF CUSTOMERS TOO */}
              <div className="p-3.5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300 flex items-center gap-1.5">
                    <Target size={14} />
                    <span>សកម្មភាព និងសាររំលឹកប្រចាំសប្ដាហ៍</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">គោលការណ៍ EMMI</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 text-[11px] mb-0.5">១. វិន័យ</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">ទម្លាក់ Daily Report រៀងរាល់ល្ងាច</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 text-[11px] mb-0.5">២. ការបិទការលក់</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">ឆាតរកភ្ញៀវចាស់ និងភ្ញៀវគោលដៅ</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 text-[11px] mb-0.5">៣. ទម្លាប់</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">Follow Up ៧ថ្ងៃម្តង មិនអោយខកខាន</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbe9ee]/60 dark:bg-white/5 border border-[#eadadd]/60 dark:border-white/5">
                    <p className="font-bold text-[#7b1e3a] dark:text-pink-300 text-[11px] mb-0.5">៤. ផ្នត់គំនិត</p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">ជួយដោះស្រាយបញ្ហាភ្ញៀវដោយស្មោះ</p>
                  </div>
                </div>
              </div>

              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-[#230c14] dark:text-white">
                    បញ្ជីអតិថិជន
                  </h2>
                  <p className="text-xs text-gray-500">
                    {currentRole === "seller"
                      ? `ទិន្នន័យរបស់ ${currentUser} (សរុប ${customerCounts.all} នាក់)`
                      : `ទិន្នន័យ Admin ទាំងក្រុម (សរុប ${customerCounts.all} នាក់)`}
                  </p>
                </div>

                {/* Admin Seller Filter */}
                {currentRole === "admin" && (
                  <select
                    value={adminSellerFilter}
                    onChange={(e) => setAdminSellerFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white dark:bg-white/10 border border-[#eadadd] dark:border-white/10 text-xs font-bold outline-none"
                  >
                    <option value="all">អ្នកលក់ទាំងអស់</option>
                    {ALL_USERS.filter((u) => u.role === "seller").map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Sub-Tab Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setCustomerFilterTab("today_followup")}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    customerFilterTab === "today_followup"
                      ? "bg-[#7b1e3a] text-white shadow-sm"
                      : "bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ត្រូវ Follow Up ថ្ងៃនេះ ({customerCounts.today})
                </button>
                <button
                  onClick={() => setCustomerFilterTab("overdue")}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    customerFilterTab === "overdue"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white dark:bg-white/5 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
                  }`}
                >
                  ⚠️ ហួសថ្ងៃ ({customerCounts.overdue})
                </button>
                <button
                  onClick={() => setCustomerFilterTab("near_runout")}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    customerFilterTab === "near_runout"
                      ? "bg-[#7b1e3a] text-white shadow-sm"
                      : "bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ជិតអស់ផលិតផល ({customerCounts.nearRunout})
                </button>
                <button
                  onClick={() => setCustomerFilterTab("followed_up")}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    customerFilterTab === "followed_up"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white dark:bg-white/5 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  ✅ បាន Follow Up រួច ({customerCounts.followed})
                </button>
                <button
                  onClick={() => setCustomerFilterTab("all")}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    customerFilterTab === "all"
                      ? "bg-[#7b1e3a] text-white shadow-sm"
                      : "bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  ទាំងអស់ ({customerCounts.all})
                </button>
              </div>

              {/* Search Box & Month Filter Row (ដាក់ខែអោយរើសផង) */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ស្វែងរកតាម ឈ្មោះ លេខទូរសព្ទ ឬទីតាំង..."
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                  />
                </div>

                {/* Month Dropdown Filter */}
                <div className="relative shrink-0">
                  <select
                    value={customerMonthFilter}
                    onChange={(e) => setCustomerMonthFilter(e.target.value)}
                    className="w-full sm:w-auto h-11 px-3.5 pr-8 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold text-[#7b1e3a] dark:text-pink-300 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="all">📅 គ្រប់ខែទាំងអស់</option>
                    {availableCustomerMonths.map((m) => (
                      <option key={m} value={m}>
                        📅 {formatKhmerMonth(m)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-3.5 pointer-events-none text-gray-400">
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Customer Cards Grid (Single col on mobile, 2 cols on tablet/desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCustomers.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-white dark:bg-white/5 rounded-3xl border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
                    {customerFilterTab === "today_followup" ? (
                      <>
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                          🎉
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#230c14] dark:text-white">
                            ពុំមានភ្ញៀវត្រូវ Follow Up ចំថ្ងៃនេះទេ (០ នាក់)
                          </h3>
                          {customerCounts.overdue > 0 ? (
                            <p className="text-xs text-red-500 mt-1 max-w-md mx-auto">
                              ប៉ុន្តែអ្នកមានអតិថិជនហួសកាលកំណត់ចំនួន <strong className="font-black text-red-600 dark:text-red-400">{customerCounts.overdue} នាក់</strong> ដែលកំពុងរង់ចាំការ Follow Up!
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-1">
                              អតិថិជនទាំងអស់ត្រូវបានតាមដានទាន់ពេលវេលា
                            </p>
                          )}
                        </div>
                        {customerCounts.overdue > 0 && (
                          <div className="pt-1">
                            <button
                              onClick={() => setCustomerFilterTab("overdue")}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                              <span>👉 ពិនិត្យមើលភ្ញៀវហួសថ្ងៃ ({customerCounts.overdue} នាក់)</span>
                            </button>
                          </div>
                        )}
                      </>
                    ) : customerFilterTab === "overdue" ? (
                      <>
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
                          ✅
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#230c14] dark:text-white">
                            ពុំមានភ្ញៀវហួសកាលកំណត់ទេ
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            អ្នកបានបំពេញការងារ Follow Up បានយ៉ាងល្អប្រសើរ
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">
                        ពុំមានអតិថិជនក្នុងលក្ខខណ្ឌ ឬការស្វែងរកនេះទេ
                      </p>
                    )}
                  </div>
                ) : (
                  displayedCustomers.map((c) => {
                    const info = getCustomerFollowInfo(c);
                    const cleanPhone = c.phone ? c.phone.replace(/[^0-9+]/g, "") : "";

                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-3xl bg-white dark:bg-white/5 border transition-all shadow-sm space-y-3 ${
                          info.isFollowedUp && !info.isNextOverdue
                            ? "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/10"
                            : (!info.isFollowedUp && c.isOverdue) || info.isNextOverdue
                            ? "border-red-300 dark:border-red-900/60 bg-red-50/15"
                            : "border-[#eadadd] dark:border-white/10"
                        }`}
                      >
                        {/* Header: Name, Boxes & Status Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-[#230c14] dark:text-white">
                                {c.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbe9ee] text-[#7b1e3a] dark:bg-[#3e1321] dark:text-pink-300 font-bold shrink-0">
                                {c.boxes} ប្រអប់
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              ទិញថ្ងៃ: <strong className="text-gray-700 dark:text-gray-300">{c.purchaseDate}</strong> (ប្រើបាន {c.daysSincePurchase} ថ្ងៃ)
                            </p>
                          </div>

                          {/* Top Badges */}
                          <div className="flex flex-col items-end gap-1">
                            {info.isFollowedUp && !info.isNextOverdue && !info.isNextDueToday ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-700 shrink-0 flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                <span>Follow រួច ({info.totalFollowCount}ដង)</span>
                              </span>
                            ) : info.isNextDueToday || c.isDueToday ? (
                              <span className="px-3 py-1 rounded-full bg-[#fbe9ee] text-[#7b1e3a] dark:bg-[#3e1321] dark:text-pink-300 text-[10px] font-black border border-[#7b1e3a]/30 shrink-0">
                                ⏰ ត្រូវ Follow ថ្ងៃនេះ
                              </span>
                            ) : (!info.isFollowedUp && c.isOverdue) || info.isNextOverdue ? (
                              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black shadow-sm shrink-0 flex items-center gap-1 animate-pulse">
                                ⚠️ ហួស {c.overdueDays || 1} ថ្ងៃ
                              </span>
                            ) : c.isNearRunout ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-sm shrink-0">
                                🔥 ជិតអស់ ({c.daysSincePurchase}/{c.boxes * 15}ថ្ងៃ)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-medium shrink-0">
                                កំពុងប្រើ ({c.daysSincePurchase}ថ្ងៃ)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Phone & Location Details Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs">
                          {/* Phone Number Box */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                              <Phone size={13} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-medium">លេខទូរសព្ទ</p>
                              <p className="text-xs font-bold text-[#230c14] dark:text-white select-all">
                                {c.phone && c.phone !== "មិនទាន់មានលេខ" ? c.phone : "មិនទាន់មានលេខ"}
                              </p>
                            </div>
                          </div>

                          {/* Location Box */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-[#7b1e3a] dark:text-pink-300 flex items-center justify-center shrink-0">
                              <MapPin size={13} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-medium">ទីតាំង</p>
                              <p className="text-xs font-bold text-[#230c14] dark:text-white truncate">
                                {c.location || "មិនបានបញ្ជាក់"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Follow-up Schedule & Status Card (Meeting User Request Explicitly) */}
                        <div className="p-3 rounded-2xl bg-[#fbe9ee]/50 dark:bg-white/5 border border-[#eadadd] dark:border-white/10 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              {info.isFollowedUp ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-black flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 size={13} className="text-emerald-600" />
                                  <span>បាន Follow Up រួច</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1">
                                  <Clock size={13} />
                                  <span>មិនទាន់បាន Follow Up</span>
                                </span>
                              )}

                              <span className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300">
                                (សរុប {info.totalFollowCount} ដង)
                              </span>
                            </div>

                            {info.lastFollowDate && (
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <span>កាលបរិច្ឆេទ Follow:</span>
                                <strong className="text-gray-800 dark:text-gray-200">{info.lastFollowDate}</strong>
                              </span>
                            )}
                          </div>

                          {/* Next follow-up schedule (រួចត្រូវ follow ថ្ងៃណាទៀត) */}
                          <div className="pt-1.5 border-t border-[#eadadd]/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                              <Calendar size={13} className="text-[#7b1e3a] dark:text-pink-300 shrink-0" />
                              <span>ត្រូវ Follow លើកបន្ទាប់ថ្ងៃ:</span>
                              <strong className={`px-2 py-0.5 rounded-lg font-black ${
                                info.isNextDueToday
                                  ? "bg-amber-400 text-amber-950 animate-pulse"
                                  : info.nextFollowDate && info.nextFollowDate < datesInfo.todayStr
                                  ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                  : "bg-white dark:bg-white/10 text-[#7b1e3a] dark:text-pink-300 border border-[#eadadd] dark:border-white/10"
                              }`}>
                                {info.nextFollowDate || "មិនទាន់កំណត់"}
                              </strong>
                            </div>

                            {info.isNextDueToday && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                                ⏰ ដល់ថ្ងៃត្រូវ Follow ថ្ងៃនេះ!
                              </span>
                            )}
                            {info.isNextOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black animate-pulse">
                                ⚠️ ហួសថ្ងៃកំណត់លើកបន្ទាប់!
                              </span>
                            )}
                          </div>

                          {/* Follow-up Note */}
                          {info.note && (
                            <div className="pt-1 text-[11px] text-gray-600 dark:text-gray-400 italic">
                              💬 "{info.note}"
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/5">
                          <div className="text-[11px] text-gray-500">
                            {info.isFollowedUp ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                ✅ កំពុងតាមដានជាប់លាប់
                              </span>
                            ) : c.isDueToday ? (
                              <span className="text-[#7b1e3a] dark:text-pink-300 font-bold">
                                ⏰ ភ្ញៀវត្រូវតាមដានថ្ងៃនេះ
                              </span>
                            ) : (
                              <span>រង់ចាំជុំបន្ទាប់</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {cleanPhone && (
                              <a
                                href={`tel:${cleanPhone}`}
                                className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <Phone size={13} />
                                <span>តេផ្ទាល់</span>
                              </a>
                            )}
                            <button
                              onClick={() => openFollowUpModal(c)}
                              className="h-9 px-3.5 rounded-xl bg-[#7b1e3a] hover:bg-[#66162e] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle2 size={14} />
                              <span>{info.isFollowedUp ? "+ Follow បន្ត" : "+ Follow Up"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Smooth Load More Pagination Button */}
                {filteredCustomers.length > visibleCount && (
                  <div className="col-span-full pt-3 pb-2 flex flex-col items-center gap-2">
                    <p className="text-[11px] text-gray-500">
                      កំពុងបង្ហាញ {displayedCustomers.length} ក្នុងចំណោម {filteredCustomers.length} នាក់
                    </p>
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 25)}
                      className="px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 hover:border-[#7b1e3a] text-xs font-bold text-[#7b1e3a] dark:text-pink-300 shadow-sm active:scale-95 transition-all"
                    >
                      បង្ហាញបន្ថែម (+25 នាក់) ⬇
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: REPORTS (matching user screenshot 7)          */}
          {/* ==================================================== */}
          {activeTab === "reports" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header Title (matching Screenshot 7) */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#230c14] dark:text-white">
                    របាយការណ៍របស់ខ្ញុំ
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    បំពេញ Daily Report នៅចុងថ្ងៃ រួច Admin នឹងឃើញ Report នេះក្នុងទំព័ររបស់គាត់។
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>ទិន្នន័យចុងក្រោយ</span>
                </div>
              </div>

              {/* Sub-Tab Switcher (matching Screenshot 7) */}
              <div className="p-1 rounded-2xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 flex gap-1 shadow-sm max-w-md mx-auto sm:max-w-none">
                <button
                  onClick={() => setReportSubTab("daily")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reportSubTab === "daily"
                      ? "bg-[#7b1e3a] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  បំពេញប្រចាំថ្ងៃ
                </button>
                <button
                  onClick={() => setReportSubTab("weekly")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    reportSubTab === "weekly"
                      ? "bg-[#7b1e3a] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  សង្ខេបប្រចាំសប្ដាហ៍
                </button>
              </div>

              {reportSubTab === "daily" ? (
                /* Daily Report Form (matching Screenshot 7) */
                <form
                  onSubmit={handleSubmitReport}
                  className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-4 overflow-hidden"
                >
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full bg-pink-100 dark:bg-[#3e1321] text-[10px] font-bold text-[#7b1e3a] dark:text-pink-300 mb-1">
                      Daily Report
                    </span>
                    <h3 className="text-base font-bold text-[#230c14] dark:text-white">
                      សកម្មភាពការងារប្រចាំថ្ងៃ
                    </h3>
                    <p className="text-xs text-gray-500">
                      បំពេញរៀងរាល់ថ្ងៃចុងម៉ោង ដើម្បីកត់ត្រាសកម្មភាពការងារ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="min-w-0">
                      <label className="block text-xs font-bold mb-1.5">អ្នករាយការណ៍</label>
                      <input
                        type="text"
                        value={currentUser}
                        readOnly
                        className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs text-gray-600 dark:text-gray-300 outline-none"
                      />
                    </div>
                    <div className="min-w-0">
                      {renderDateInputBox(reportDate, setReportDate, "កាលបរិច្ឆេទរបាយការណ៍")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold mb-1">ភ្ញៀវចាស់ឆាត (នាក់)</label>
                      <input
                        type="number"
                        min="0"
                        value={chatGuests}
                        onChange={(e) => setChatGuests(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">ភ្ញៀវឆាតរកគោលដៅចំនួន (នាក់)</label>
                      <input
                        type="number"
                        min="0"
                        value={chatTarget}
                        onChange={(e) => setChatTarget(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold mb-1">ទទួលទាក់ទងភ្ញៀវចាស់ (ប្រអប់)</label>
                      <input
                        type="number"
                        min="0"
                        value={oldCustomerBoxes}
                        onChange={(e) => setOldCustomerBoxes(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">លក់បានចំនួន (ប្រអប់)</label>
                      <input
                        type="number"
                        min="0"
                        value={soldCount}
                        onChange={(e) => setSoldCount(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">ថ្ងៃនេះបានធ្វើអ្វីខ្លះ?</label>
                    <textarea
                      rows={3}
                      value={activities}
                      onChange={(e) => setActivities(e.target.value)}
                      placeholder="ឧ. ចុះជួប ឬមើលថែភ្ញៀវត្រៀមទិញ..."
                      className="w-full p-3.5 rounded-xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                    />
                  </div>

                  {reportSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>បានរក្សាទុក Daily Report ទៅក្នុង Google Sheet រួចរាល់!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="w-full h-12 rounded-xl bg-[#7b1e3a] hover:bg-[#66162e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                  >
                    <span>{submittingReport ? "កំពុងរក្សាទុក..." : "💾 រក្សាទុក Daily Report"}</span>
                  </button>
                </form>
              ) : (
                /* Weekly Summary List */
                <div className="space-y-3">
                  <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-[#eadadd] dark:border-white/10 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-[#7b1e3a] dark:text-pink-300">
                      ប្រវត្តិ Daily Reports ដែលបានទម្លាក់
                    </h3>

                    {reports.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">មិនទាន់មានរបាយការណ៍ទេ</p>
                    ) : (
                      reports
                        .filter(
                          (r) =>
                            currentRole === "admin" ||
                            r.seller.toLowerCase() === currentUser.toLowerCase()
                        )
                        .slice(0, 10)
                        .map((r) => (
                          <div
                            key={r.id}
                            className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{r.seller} ({r.date})</span>
                              <span className="text-[#7b1e3a] dark:text-pink-300">
                                លក់បាន {r.soldCount} ប្រអប់
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                              <span>ភ្ញៀវចាស់: {r.chatGuests}</span>
                              <span>ភ្ញៀវគោលដៅ: {r.chatTarget}</span>
                              <span>ប្រអប់ភ្ញៀវចាស់: {r.oldCustomerBoxes}</span>
                            </div>
                            {r.activities && (
                              <p className="text-[11px] text-gray-600 dark:text-gray-300 italic pt-1 border-t border-gray-200/40">
                                "{r.activities}"
                              </p>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Informational Cards (matching Screenshot 7) */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Report Sheet ថ្មី (Write destination)</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-relaxed">
                    Daily Report នឹងត្រូវកត់ទៅ Sheet ថ្មី! Sheet 'Emmi Data' នៅតែ read-only មិនត្រូវបានកែប្រែ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: ORDER FORM (ទម្រង់កុម្មង់ទំនិញ VST)             */}
          {/* ==================================================== */}
          {activeTab === "order" && renderOrderTab()}
        </main>

        {/* Floating Bottom Navigation Bar (matching user screenshots 1, 3, 4) */}
        <nav className="fixed bottom-3.5 sm:bottom-5 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
          <div className="w-full max-w-md h-16 rounded-full bg-white/95 dark:bg-[#2a111a]/95 backdrop-blur-md border border-[#eadadd] dark:border-white/10 shadow-xl flex items-center justify-around px-2 pointer-events-auto">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                activeTab === "dashboard"
                  ? "text-[#7b1e3a] dark:text-pink-400 font-bold scale-105"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-[10px] mt-0.5">{language === "en" ? "Home" : "ទំព័រដើម"}</span>
            </button>

            {/* 2. Customers */}
            <button
              onClick={() => {
                setActiveTab("customers");
                if (customerCounts.today === 0 && customerCounts.overdue > 0) {
                  setCustomerFilterTab("overdue");
                }
              }}
              className={`flex flex-col items-center justify-center w-14 py-1 relative transition-all ${
                activeTab === "customers"
                  ? "text-[#7b1e3a] dark:text-pink-400 font-bold scale-105"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <Users size={18} />
              <span className="text-[10px] mt-0.5">{language === "en" ? "Clients" : "អតិថិជន"}</span>
              {customerCounts.today > 0 ? (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white"></span>
              ) : customerCounts.overdue > 0 ? (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              ) : null}
            </button>

            {/* 3. Center Order Button (Elevated Circle) -> Direct Link */}
            <div className="relative -top-3">
              <a
                href={ORDER_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={language === "en" ? "Place Order" : "កុម្ម៉ង់ទំនិញ"}
                className="w-[52px] h-[52px] rounded-full bg-[#7b1e3a] hover:bg-[#66162e] active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white dark:border-[#2a111a] transition-all cursor-pointer"
              >
                <ShoppingBag size={20} />
                <span className="text-[9px] font-bold">{language === "en" ? "Order" : "កុម្ម៉ង់"}</span>
              </a>
            </div>

            {/* 4. Reports */}
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                activeTab === "reports"
                  ? "text-[#7b1e3a] dark:text-pink-400 font-bold scale-105"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <FileText size={18} />
              <span className="text-[10px] mt-0.5">{language === "en" ? "Reports" : "របាយការណ៍"}</span>
            </button>

            {/* 5. Ranking */}
            <button
              onClick={() => setActiveTab("ranking")}
              className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                activeTab === "ranking"
                  ? "text-[#7b1e3a] dark:text-pink-400 font-bold scale-105"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              <Trophy size={18} />
              <span className="text-[10px] mt-0.5">{language === "en" ? "Ranking" : "ចំណាត់ថ្នាក់"}</span>
            </button>
          </div>
        </nav>

        {/* Quick Follow-up Modal with Date & Next Schedule - ROOT LEVEL (Fixed z-[100] for Perfect Mobile Display) */}
        {modalCustomer && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setModalCustomer(null)} />

            <div className="relative w-full max-w-lg p-5 rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#2a111a] border border-[#eadadd] dark:border-white/10 shadow-2xl space-y-3.5 max-h-[88dvh] overflow-y-auto overscroll-contain">
              {/* Mobile Drag Indicator Bar */}
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-white/20 mx-auto -mt-1 mb-2 sm:hidden" />

              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10">
                <div>
                  <h4 className="text-sm font-black text-[#230c14] dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>កត់ត្រាការ Follow Up អតិថិជន</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {modalCustomer.name} · 📞 {modalCustomer.phone} · 📦 {modalCustomer.boxes} ប្រអប់
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCustomer(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black dark:text-gray-400 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Grid: Follow-up Date & Next Follow-up Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="min-w-0">
                  {renderDateInputBox(followUpModalDate, setFollowUpModalDate, "📅 បាន Follow Up ថ្ងៃណា:")}
                </div>

                <div className="min-w-0">
                  {renderDateInputBox(followUpNextDate, setFollowUpNextDate, "🗓️ ត្រូវ Follow ថ្ងៃណាទៀត:")}
                </div>
              </div>

              {/* Quick Presets for Next Follow-up Date */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-medium">ជ្រើសរើសរហ័សសម្រាប់លើកក្រោយ:</span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
                      setFollowUpNextDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-[#7b1e3a] hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    +7 ថ្ងៃ (១ សប្ដាហ៍)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 14 * 24 * 3600 * 1000);
                      setFollowUpNextDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-[#7b1e3a] hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    +14 ថ្ងៃ (២ សប្ដាហ៍)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
                      setFollowUpNextDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-[#7b1e3a] hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    +3 ថ្ងៃ (ឆាប់ៗ)
                  </button>
                </div>
              </div>

              {/* Contact Method & Status */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    វិធីទាក់ទង:
                  </label>
                  <select
                    value={followUpMethod}
                    onChange={(e) => setFollowUpMethod(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="តាមឆាត">💬 តាមឆាត (Telegram/FB)</option>
                    <option value="តាមតេ">📞 តាមតេ (Call)</option>
                    <option value="ជួបផ្ទាល់">👥 ជួបផ្ទាល់</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    ស្ថានភាពភ្ញៀវ:
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value)}
                    className="w-full h-10 px-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="បាន Follow Up រួច">✅ បាន Follow Up រួច</option>
                    <option value="កំពុងប្រើប្រាស់">💊 កំពុងប្រើប្រាស់</option>
                    <option value="ជិតអស់ផលិតផល">🔥 ជិតអស់ផលិតផល</option>
                    <option value="ចង់ទិញថែម">📦 ចង់ទិញថែម</option>
                    <option value="មិនទាន់ឆ្លើយតប">⏳ មិនទាន់ឆ្លើយតប</option>
                  </select>
                </div>
              </div>

              {/* Note Area */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  កំណត់សម្គាល់ការសន្ទនា (សរសេរពាក្យសម្ដីភ្ញៀវ):
                </label>
                <textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="ឧ. ភ្ញៀវប្រាប់ថាបាត់ឈឺចង្កេះ ជិតអស់ប្រអប់ទី១ ចង់កុម្ម៉ង់ថែម..."
                  className="w-full h-20 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eadadd] dark:border-white/10 text-xs outline-none focus:border-[#7b1e3a]"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-2 pt-2 pb-1 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalCustomer(null)}
                  className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold hover:bg-gray-200 active:scale-98 transition-all cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={handleSaveFollowup}
                  className="flex-1 h-11 rounded-xl bg-[#7b1e3a] hover:bg-[#66162e] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                >
                  <Check size={16} />
                  <span>រក្សាទុក Follow Up (+1 ដង)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
