# Kuşçuoğlu Hafriyat — Saha defteri

Sahibinin telefonundan kullandığı defter. Gelir, gider, mazot, aylık ve yıllık grafikler, ödenmemiş iş hatırlatması ve şirket ya da şahıs için hazırlanmış fatura PDF’i.

Ana sayfa uygulamadır. Sahip Bedir Berk Kuşçu, telefon 0553 108 48 54. Bu ikisi uygulama çubuğunda ve fatura PDF’inde durur. Ünvan, adres ve e-posta firma kartına yazılmadan belgede görünmez. Faturada iş tarihi ile fatura tarihi ayrıdır. Gecikme fatura tarihine bakar.

İndirilen fatura hazırlanmış bir PDF’tir. GİB e-Fatura değildir.

PDF yazı tipi: [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans), SIL Open Font License.

## Çalıştırma

```bash
npm install
npm run dev
```

Geliştirme adresi: [http://127.0.0.1:4721](http://127.0.0.1:4721)

## Kayıt

Defter GitHub’da `data/ledger.json` dosyasında durur. Firma → Ayarlar’a bir kez jeton yapıştırıp **Bağla ve kaydet** deyin. Sonraki değişiklikler kendiliğinden yazılır.

Jeton yalnızca bu tarayıcıda kalır. Depoya konmaz.

Jeton: [ince ayarlı jeton oluştur](https://github.com/settings/personal-access-tokens/new). Yalnızca KuscuogluHafriyat, Contents: Read and write.

Bağlamadan uygulama açılır; kayıtlar kalıcı olmaz. Üstte hata çıkarsa **Şimdi kaydet** yeter.

## Statik dışa aktarma

```bash
npm run build
```

Çıktı `out/` klasörüdür. GitHub proje sayfası için:

```bash
NEXT_PUBLIC_BASE_PATH=/KuscuogluHafriyat npm run build
```

`.github/workflows/pages.yml` bu önekle derleyip GitHub Pages’e yükler.
