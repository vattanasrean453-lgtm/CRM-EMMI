# EMMI Sales CRM (Live Google Sheets Sync)

ប្រព័ន្ធគ្រប់គ្រងការលក់ និងតាមដានអតិថិជន (Mobile-First CRM) សម្រាប់ក្រុមការងារ EMMI ដោយភ្ជាប់ Live Sync ជាមួយ Google Sheets។

## 🌟 លក្ខណៈពិសេស (Features)
- **Live Google Sheets Sync**: ទាញទិន្នន័យផ្ទាល់ពី Google Sheet (`Master data` និង `Customer Follow-up `)
- **Dashboard & KPIs**: បង្ហាញចំនួនអតិថិជនសរុប, អ្នកត្រូវតាមដានថ្ងៃនេះ, អ្នកហួសថ្ងៃ (Overdue), អ្នកប្រើអស់/មិនទាន់ទិញ, និងចំនួនលក់បានសរុប
- **Customer Follow-up Management**: ស្វែងរក, Filter តាមអ្នកលក់/ស្ថានភាព, និងកត់ត្រាការ Follow-up (Log action) រត់ទៅ Sheet វិញផ្ទាល់
- **Leaderboard / Ranking**: ចំណាត់ថ្នាក់អ្នកលក់តាមចំនួនប្រអប់ដែលលក់បានជាក់ស្ដែង
- **Daily Reports**: បញ្ចូលរបាយការណ៍លក់ប្រចាំថ្ងៃចូលក្នុង Sheet `DailyReports`
- **Mobile-First UI**: ដំណើរការរលូនលើទូរសព្ទដៃ, មាន Dark Mode, និងកំណត់ទំហំអក្សរបាន

## 🛠️ របៀបដំណើរការលើម៉ាស៊ីនផ្ទាល់ (Local Development)

```bash
# ដំណើរការ Development Server
npm run dev
```

បើក Browser ទៅកាន់ [http://localhost:3000](http://localhost:3000)

## 🚀 របៀប Deploy ទៅកាន់ Vercel
1. Upload កូដនេះទៅកាន់ GitHub
2. ភ្ជាប់ Repository នោះជាមួយ Vercel
3. កំណត់ **Environment Variables** នៅក្នុង Vercel Dashboard (យកតាមតម្លៃក្នុង `.env.local`):
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_SHEET_ID_DATA`
   - `GOOGLE_SHEET_ID_REPORTS`
   - `ADMIN_PASSWORD`
