export const services = [
  {
    title: "Hafriyat",
    summary: "Parsel kazısı, şev ve çıkan toprağın sahadan alınması.",
    body: "Kot, şev ve döküm güzergâhı işe başlamadan yazılır. Hacim m³ ile takip edilir; kamyon seferi ayrı kalemde durur.",
    measure: "m³ ve sefer",
  },
  {
    title: "Kepçe",
    summary: "Lastikli ve paletli kepçe, dar sokak ya da açık saha.",
    body: "Şehir içinde lastikli kepçe, yumuşak zeminde ve derin kazıda paletli ekskavatör. İntikal ve çalışma saati teklifte ayrılır.",
    measure: "saat / gün",
  },
  {
    title: "Kazı",
    summary: "Temel çukuru, bodrum kotu ve kaba hafriyat.",
    body: "Kazı sınırı ve teslim kotu sahada işaretlenir. Yan şev ve geçici tahkimat ihtiyacı keşif notuna girer.",
    measure: "m³",
  },
  {
    title: "Dolgu",
    summary: "Kontrollü dolgu, serme ve saha kotuna getirme.",
    body: "Dolgu malzemesi ve serim kalınlığı işin başında netleşir. Loder serer, kamyon malzeme taşır.",
    measure: "m³",
  },
  {
    title: "Yıkım",
    summary: "Yapı yıkımı, kırıcı uç ve enkazın ayrılması.",
    body: "Kat yüksekliği, bitişik yapı ve çevre mesafesi keşifte bakılır. Beton için kırıcı, enkaz için kamyon planlanır.",
    measure: "gün ve sefer",
  },
  {
    title: "Moloz nakliyesi",
    summary: "Yıkım ve kazı artıkının damperli kamyonla çıkarılması.",
    body: "Sefer sayısı ve döküm yeri iş emrinde yazar. Saha içi yükleme ile şehir içi nakliye aynı listede durur.",
    measure: "sefer",
  },
  {
    title: "Temel ve kanal kazısı",
    summary: "Temel çukuru, şebeke hendeği, yağmur suyu hattı.",
    body: "Hendek genişliği, derinlik ve boru payı metrajda ayrı durur. Dar alanda kova seçimi sahaya göre yapılır.",
    measure: "metre ve m³",
  },
  {
    title: "Saha düzenleme",
    summary: "Tesviye, çevre kotu ve iş bitiminde düzenli teslim.",
    body: "Kazı bittikten sonra loder ile tesviye, geçici yol ve çevre temizliği kapanış işidir. Kot farkı keşifte konuşulur.",
    measure: "m² / gün",
  },
] as const;

export const fleet = [
  {
    name: "Paletli ekskavatör",
    classLabel: "Ağır kazı sınıfı",
    role: "Temel, derin kanal ve kırıcı uç isteyen kaya ya da beton.",
    points: [
      "Açık arazide temel ve bodrum kazısı",
      "Hidrolik kırıcı ile beton ve kaya",
      "Geniş kova ile kaba hafriyat",
    ],
  },
  {
    name: "Lastikli kepçe",
    classLabel: "Şehir içi sınıf",
    role: "Kaplama yolda intikal, dar parsel ve kısa süreli kazı.",
    points: [
      "Nakliyesi paletliye göre hızlı",
      "Site içi ve yol kenarı işleri",
      "Kanal, tesviye ve yükleme",
    ],
  },
  {
    name: "Loder",
    classLabel: "Yükleme ve serme",
    role: "Dolgu serme, kamyona yükleme, saha tesviyesi.",
    points: [
      "Malzemeyi sermek ve kabaca sıkıştırmak",
      "Moloz ve toprağı kamyona yüklemek",
      "Teslim kotuna yaklaştırmak",
    ],
  },
  {
    name: "Damperli kamyon",
    classLabel: "Nakliye",
    role: "Hafriyat toprağı ve molozun saha dışına çıkarılması.",
    points: [
      "Sefer bazlı teklif",
      "Kazı ile aynı gün program",
      "Döküm yeri iş başlamadan yazılır",
    ],
  },
] as const;

export const jobs = [
  {
    title: "Konut temel çukuru",
    kind: "Temel kazısı",
    measure: "yaklaşık 900 m³",
    machines: "Paletli ekskavatör, kamyon",
    summary:
      "Parseli açık bir konut temeli. Kazı kotu işaretlenir, çıkan toprak seferle çıkar, teslimde çukur kenarı temiz bırakılır.",
  },
  {
    title: "Yağmur suyu hendeği",
    kind: "Kanal kazısı",
    measure: "hat boyunca metre",
    machines: "Lastikli kepçe",
    summary:
      "Site içi yağmur suyu hattı. Hendek dar tutulur, boru payı metrajda ayrı yazılır, kaplama yola lastikli makine girer.",
  },
  {
    title: "Sanayi parseli tesviyesi",
    kind: "Saha düzenleme",
    measure: "dolgu ve serme",
    machines: "Loder, kamyon",
    summary:
      "Eğimli sanayi parseli. Dolgu getirilir, loder serer, teslim kotu keşifteki nota göre kapanır.",
  },
  {
    title: "Tek katlı yapı yıkımı",
    kind: "Yıkım ve moloz",
    measure: "gün + sefer",
    machines: "Ekskavatör kırıcı, kamyon",
    summary:
      "Bitişik yapıya mesafe bırakılarak yıkım. Beton kırılır, moloz sahadan seferle çıkar, zemin süpürülür.",
  },
  {
    title: "Yol kenarı dolgu",
    kind: "Dolgu",
    measure: "m³ dolgu",
    machines: "Loder, kamyon",
    summary:
      "Çöken yol kenarına kontrollü dolgu. Malzeme sahaya kamyonla gelir, loder serer, kenar şevlenir.",
  },
  {
    title: "Bodrum hafriyatı",
    kind: "Hafriyat",
    measure: "derin kazı, m³",
    machines: "Paletli ekskavatör, kamyon",
    summary:
      "Bodrum kotuna inen kazı. Şev ve çevre mesafesi işin başında konuşulur, nakliye kazı hızına göre bağlanır.",
  },
] as const;

export const steps = [
  {
    n: "01",
    title: "Keşif",
    text: "Saha gezilir. Erişim, kot, bitişik yapı ve döküm güzergâhı not edilir.",
  },
  {
    n: "02",
    title: "Kapsam",
    text: "Kazı, dolgu, yıkım ve sefer aynı listede, KDV ayrı satırda yazılır.",
  },
  {
    n: "03",
    title: "Makine",
    text: "Ekskavatör, kepçe, loder ve kamyon aynı güne bağlanır. Boş bekletilmez.",
  },
  {
    n: "04",
    title: "Teslim",
    text: "Çukur, hendek ya da tesviye kapanır. Moloz sahada bırakılmaz.",
  },
] as const;
