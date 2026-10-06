# Kuşçuoğlu Hafriyat — Saha defteri

Sahibinin telefonundan kullandığı defter. Gelir, gider, mazot, aylık ve yıllık grafikler, ödenmemiş iş hatırlatması ve şirket ya da şahıs için hazırlanmış fatura PDF’i.

Ana sayfa uygulamadır. Sahip Bedir Berk Kuşçu, telefon 0553 108 48 54. Bu ikisi uygulama çubuğunda ve fatura PDF’inde durur. Adres, vergi dairesi ve VKN firma kartına yazılmadan belgede görünmez.

İndirilen fatura hazırlanmış bir PDF’tir. GİB e-Fatura değildir.

PDF yazı tipi: [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans), SIL Open Font License.

## Çalıştırma

```bash
npm install
npm run dev
```

Geliştirme adresi: [http://127.0.0.1:4721](http://127.0.0.1:4721)

## Defter nerede durur

Kayıtlar `Serdarza/KuscuogluHafriyat` deposunda `data/ledger.json` dosyasına yazılır (`main`). Tarayıcı temizlenince defter durur, çünkü asıl kopya depodadır.

Jeton yalnızca bu tarayıcının `localStorage` alanındadır. Depoya, defter dosyasına veya bu projeye yazılmaz.

Jeton yokken veya ağ yokken defter bu tarayıcıda düzenlenebilir. Üstte “henüz GitHub’a yazılmadı” uyarısı çıkar. **GitHub’a kaydet** ile gönderilir.

Uzak dosya yoksa veya boşsa uygulama örnek satırlar açar. Dolu bir dosyanın üzerine örnek yazmaz. Örnekler siz kaydedene kadar depoya gitmez.

## İnce ayarlı jeton

1. GitHub’da **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. **Generate new token**.
3. Resource owner, `KuscuogluHafriyat` deposunun sahibi olsun (`Serdarza`).
4. Repository access: **Only select repositories** → yalnızca `KuscuogluHafriyat`.
5. Permissions → **Contents: Read and write**. Başka izin vermeyin.
6. Jetonu oluşturup kopyalayın. GitHub bunu bir daha göstermez.
7. Uygulamada **Firma** sekmesi → **Ayarlar**. Jetonu yapıştırın, **Jetonu bu tarayıcıya kaydet**.
8. **GitHub’a kaydet**.

Depo sahibi, adı, dal ve dosya yolu varsayılan olarak `Serdarza` / `KuscuogluHafriyat` / `main` / `data/ledger.json`.

## Statik dışa aktarma

```bash
npm run build
```

Çıktı `out/` klasörüdür. GitHub proje sayfası için:

```bash
NEXT_PUBLIC_BASE_PATH=/KuscuogluHafriyat npm run build
```

`.github/workflows/pages.yml` bu önekle derleyip GitHub Pages’e yükler.
