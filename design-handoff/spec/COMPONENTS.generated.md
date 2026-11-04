# Component contracts

Extracted from the .pen design file. Each reusable frame is a component; light values are canonical, dark values come from the same variables.

## Nav Item — ids/a11y: `Z0vAf` · 260×fit · gap=12 pad=10/14 align=center

- **Nav Item** · `frame` · 260×fit · gap=12 pad=10/14 align=center · REUSABLE r=10
  - **Icon** · `icon` · 18×18 · fill: #93A7C4 · icon=layout-dashboard library=lucide
    - icon: layout-dashboard [lucide] #93A7C4
  - **Label** · `text` · fit×fit · fill: #93A7C4
    - text ($font-ui 14 600 #93A7C4): "Dasbor"
  - **Badge Wrap** · `frame` · fill_container×fit · justify=end
    - **Count** · `text` · fit×fit · fill: #93A7C4
      - text ($font-mono 11 #93A7C4): ""

## Metric Card — ids/a11y: `KkQWr` · fill_container×fit · layout=vertical gap=18 pad=22

surface: surface(#FFFFFF) · dark: surface(#292A2D)

- **Metric Card** · `frame` · fill_container×fit · layout=vertical gap=18 pad=22 · fill: surface(#FFFFFF) · REUSABLE r=16 stroke=line(#E3EAF3) strokeWidth=1
  - **Top** · `frame` · fill_container×fit · justify=space_between align=center
    - **Label** · `text` · fit×fit · fill: ink-soft(#3B4A5F)
      - text ($font-ui 13 600 ink-soft(#3B4A5F)): "Total Barang"
    - **Icon Chip** · `frame` · 34×34 · justify=center align=center · fill: brand-soft(#EBEFFF) · r=10
      - **Icon** · `icon` · 17×17 · fill: brand(#2B4EFF) · icon=boxes library=lucide
        - icon: boxes [lucide] brand(#2B4EFF)
  - **Value** · `text` · fit×fit · fill: ink(#0B1B2E)
    - text ($font-ui 34 800 ls=-1.2 ink(#0B1B2E)): "40"
  - **Caption** · `text` · fill_container×fit · fill: muted(#74849A)
    - text ($font-ui 12 lh=1.4 muted(#74849A)): "Di semua laboratorium & ruang"

## Badge — ids/a11y: `QuGLj` · fit×fit · gap=7 pad=5/11 align=center

surface: mint-soft(#E4F7F0) · dark: mint-soft(#2C3630)

- **Badge** · `frame` · fit×fit · gap=7 pad=5/11 align=center · fill: mint-soft(#E4F7F0) · REUSABLE r=999
  - **Dot** · `ellipse` · 6×6 · fill: mint(#0EA47A)
  - **Label** · `text` · fit×fit · fill: mint(#0EA47A)
    - text ($font-ui 11.5 700 mint(#0EA47A)): "Tersedia"

## Button Primary — ids/a11y: `YpfPQ` · fit×fit · gap=8 pad=11/18 align=center

surface: brand(#2B4EFF) · dark: brand(#1A73E8)

- **Button Primary** · `frame` · fit×fit · gap=8 pad=11/18 align=center · fill: brand(#2B4EFF) · REUSABLE r=10
  - **Icon** · `icon` · 16×16 · fill: #FFFFFF · icon=plus library=lucide
    - icon: plus [lucide] #FFFFFF
  - **Label** · `text` · fit×fit · fill: #FFFFFF
    - text ($font-ui 13.5 700 #FFFFFF): "Tambah Barang"

## Field — ids/a11y: `gPVoD` · 260×fit · gap=10 pad=11/14 align=center

surface: surface(#FFFFFF) · dark: surface(#292A2D)

- **Field** · `frame` · 260×fit · gap=10 pad=11/14 align=center · fill: surface(#FFFFFF) · REUSABLE r=10 stroke=line(#E3EAF3) strokeWidth=1
  - **Icon** · `icon` · 16×16 · fill: muted(#74849A) · icon=search library=lucide
    - icon: search [lucide] muted(#74849A)
  - **Placeholder** · `text` · fit×fit · fill: muted(#74849A)
    - text ($font-ui 13 muted(#74849A)): "Cari nama atau barcode..."

