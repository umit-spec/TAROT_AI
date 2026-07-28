# Commercial Release Decision Matrix

**Phase:** CRG-1 (Commercial Release Gate Review)
**Date:** 2026-07-28

| Gate | Durum | Kanıt | Eksik | Owner | Sonraki aksiyon |
|---|---|---|---|---|---|
| V2-D003 — Üçüncü taraf görsel benzerlik | PARTIAL | `docs/evidence/FULL_DECK_V2_SIMILARITY_REVIEW.md` | Reverse-image search; profesyonel/hukuki değerlendirme; 4 HIGH-risk kart (Yüksek Rahibe, Kader Çarkı, Şeytan, Ay) için karar | Ürün sahibi + dış hukuk danışmanı | 4 HIGH kartı avukata yönlendir (paket §D.5–D.8); avukat kararına göre kabul/regenerasyon kararı ver |
| V2-D004 — Platform şartları kanıtı | PARTIAL | `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md`, `docs/evidence/platform-terms/` | Birincil kaynağa doğrudan erişim (403 engeli); Canva IP Policy doğrudan alıntısı; iki yeni açık soru (ChatGPT tüketici/işletme şartları, Canva paylaşım lisansı) | Ürün sahibi | Manuel tarayıcı ziyareti + tarihli ekran görüntüsü; veya avukat kendi incelemesini yapsın |
| V2-D009 — Yargı-özel hukuki inceleme | READY FOR EXTERNAL LEGAL REVIEW | `docs/legal/COMMERCIAL_RELEASE_LEGAL_REVIEW_PACKET_TR.md` | Gerçek avukat görüşü; paket §E karar tablosunun doldurulması | Dış/bağımsız hukuk danışmanı (ürün sahibinin kendisi avukat olsa da, bağımsız görüş gerekli) | Paketi (özellikle §D.0 — 677 sayılı Kanun falcılık maddesi) avukata ilet |
| V2-D010 — Marka/ürün adı temizliği | PARTIAL | `docs/legal/TRADEMARK_CLEARANCE_PRELIMINARY.md` | TÜRKPATENT/WIPO/EUIPO'da gerçek sorgu; marka vekili görüşü | Marka vekili / avukat | Profesyonel marka araştırması başlat; Türkçe pazar adını netleştir |
| Yeni bulgu — 677 sayılı Kanun (falcılık) | OPEN (yeni) | Paket §D.0; Yargıtay 7. CD E.2021/19058 K.2022/16593 (21.11.2022) dahil güncel içtihat | Avukat değerlendirmesi | Dış hukuk danışmanı | En yüksek öncelikli soru olarak pakette işaretlendi |
| Yeni bulgu — yaş politikası | OPEN (yeni) | `docs/legal/COMMERCIAL_RELEASE_CHECKLIST.md` "Product safety" | Yaş politikası kararı ve (gerekirse) uygulama | Ürün sahibi + hukuk danışmanı | Paket §D.15'e yanıt bekleniyor |
| KVKK / veri akışı bildirimi | OPEN | `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md` | Kullanıcıya yönelik aydınlatma metni yok | Ürün sahibi + hukuk danışmanı | Paket §D.9–D.12 yanıtlandıktan sonra aydınlatma metni hazırlanmalı (ayrı, onaylı bir faz) |

## Reading this matrix

No row above is CLOSED. That is the expected shape of this phase's
result, stated by the product owner before this review began: the
technical product is ready, and what this phase produces is a complete,
evidence-backed file for the lawyer and trademark agent — not a
release decision. Every "Eksik" (missing) column is either an external
action (an actual database search, an actual legal opinion) or a
product-owner factual answer (account records, a naming decision) that
this review is structurally unable to supply on its own.
