# Kuşçuoğlu Hafriyat

Saha firması için statik site ve tarayıcıda çalışan saha defteri. Hafriyat, kepçe, kazı, dolgu, yıkım, moloz nakliyesi, temel ve kanal kazısı, saha düzenleme. Filoda ekskavatör, lastikli kepçe, loder ve kamyon.

İki yüz:

- Herkese açık sayfalar: ana sayfa, hizmetler, filo, işler, hakkımızda, iletişim.
- `/panel` saha defteri: gelir, gider, mazot, aylık ve yıllık grafikler, şirket ve şahıs için hazırlanmış fatura PDF’i.

Sunucu, hesap ve veritabanı yok. Defter, firma kartı ve teklif talepleri `localStorage` içindedir. Kayıtlar yalnızca o tarayıcıda durur. Sitede sahip Bedir Berk Kuşçu ve telefon 0553 108 48 54 yazar. Adres, vergi dairesi ve VKN firma kartına siz yazmadan gösterilmez. Grafiklerin boş kalmaması için ilk açılışta **örnek** kayıtlar yüklenir. Bunlar işaretlidir, silinebilir ve düzeltilebilir.

İndirilen fatura hazırlanmış bir PDF’tir. GİB e-Fatura değildir.

PDF yazı tipi: [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans), SIL Open Font License.

## Çalıştırma

```bash
npm install
npm run dev
```

Geliştirme adresi: [http://127.0.0.1:4721](http://127.0.0.1:4721)

## Statik dışa aktarma

```bash
npm run build
```

Çıktı `out/` klasörüdür. GitHub proje sayfası (`https://<kullanıcı>.github.io/KuscuogluHafriyat/`) için derlemeden önce:

```bash
NEXT_PUBLIC_BASE_PATH=/KuscuogluHafriyat npm run build
```

`.github/workflows/pages.yml` bu önekle derleyip GitHub Pages’e yükler. Pages kaynağı “GitHub Actions” olmalıdır. Bu depoda Pages’i açmak, siteyi barındıracak GitHub hesabında ayrıca yapılır.
