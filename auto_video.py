#!/usr/bin/env python3
"""
অটো ভিডিও জেনারেটর - প্রোটোটাইপ
চালানো: python auto_video.py          (অবিরাম চলবে, থামাতে Ctrl+C)
টেস্ট:   python auto_video.py --test 3  (শুধু ৩টি ভিডিও বানিয়ে থামবে)
স্ট্যাটাস: python auto_video.py --stats
"""
import os
import sys
import time
import random
import sqlite3
import textwrap
import subprocess
import argparse
from datetime import datetime, timedelta

from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont

# ==================== কনফিগারেশন ====================
OUT_DIR = "videos"
DB = "videos.db"
DAILY_LIMIT = 100        # দিনে সর্বোচ্চ কয়টা (খরচ ও রিসোর্স নিয়ন্ত্রণ)
PAUSE_SECONDS = 5        # দুই ভিডিওর মাঝে বিরতি (সেকেন্ড)
LANG = "en"              # প্রাথমিক ভাষা (en / bn)

# ভিডিও রেজোলিউশন (৯:১৬ রেশিও - Shorts, Reels, TikTok)
WIDTH = 1080
HEIGHT = 1920

# ফ্যাক্ট তালিকা
FACTS = [
    "Honey never spoils. Archaeologists found edible honey in ancient Egyptian tombs.",
    "Octopuses have three hearts and blue blood.",
    "A day on Venus is longer than a year on Venus.",
    "Bananas are berries, but strawberries are not.",
    "Sharks existed before trees did.",
    "The Eiffel Tower grows about 15 centimeters taller in summer heat.",
    "Wombats produce cube shaped droppings.",
    "Lightning is about five times hotter than the surface of the sun.",
    "Your stomach gets a new lining every few days.",
    "There are more stars in the universe than grains of sand on Earth.",
]

# ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট কালার প্যালেট (টপ -> মিডল -> বটম)
GRADIENT_PALETTES = [
    ((15, 23, 42), (49, 46, 129), (88, 28, 135)),    # ডিপ স্লেট -> ইন্ডিগো -> পার্পল
    ((24, 4, 36), (76, 5, 25), (131, 24, 67)),       # মিডনাইট -> ক্রিমসন -> মেজেন্টা
    ((2, 44, 34), (6, 78, 59), (8, 51, 68)),         # ডার্ক এমারেল্ড -> পাইন -> সায়ান
    ((3, 7, 18), (30, 27, 75), (30, 58, 138)),       # রয়্যাল ব্ল্যাক -> নেভি -> স্যাফায়ার
    ((28, 25, 23), (69, 10, 10), (127, 29, 29)),     # চারকোল -> ব্ল্যাড রেড -> রুবি
    ((15, 23, 42), (14, 116, 144), (4, 120, 87)),    # ওশান ডিপ -> টিল -> সি-গ্রিন
]

# ফন্ট ফাইলের সম্ভাব্য পাথ (লিনাক্স / ম্যাক / উইন্ডোজ)
SYSTEM_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "C:\\Windows\\Fonts\\arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]

BENGALI_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf",
    "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf",
]


# ==================== ডাটাবেজ হ্যান্ডলার ====================
def init_db():
    """ডাটাবেজ এবং টেবিল তৈরি করে যদি আগে থেকে না থাকে"""
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fact TEXT NOT NULL,
            video_path TEXT NOT NULL,
            duration REAL DEFAULT 0.0,
            status TEXT DEFAULT 'success',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def get_today_count():
    """আজকে মোট কয়টি সফল ভিডিও বানানো হয়েছে তা বের করে"""
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) FROM videos 
        WHERE status = 'success' 
        AND date(created_at) = date('now', 'localtime')
    """)
    count = cursor.fetchone()[0]
    conn.close()
    return count


def record_video(fact, video_path, duration, status="success"):
    """ভিডিও তৈরির রেকর্ড ডাটাবেজে সংরক্ষণ করে"""
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO videos (fact, video_path, duration, status, created_at)
        VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
    """, (fact, video_path, duration, status))
    conn.commit()
    video_id = cursor.lastrowid
    conn.close()
    return video_id


def print_stats():
    """দিন, সপ্তাহ, মাস এবং বছরের পরিসংখ্যান সুন্দরভাবে প্রদর্শন করে"""
    init_db()
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    # আজ
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(duration), 0) FROM videos 
        WHERE status = 'success' AND date(created_at) = date('now', 'localtime')
    """)
    today_count, today_sec = cursor.fetchone()

    # এই সপ্তাহ (গত ৭ দিন)
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(duration), 0) FROM videos 
        WHERE status = 'success' AND created_at >= datetime('now', '-7 days', 'localtime')
    """)
    week_count, week_sec = cursor.fetchone()

    # এই মাস (গত ৩০ দিন)
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(duration), 0) FROM videos 
        WHERE status = 'success' AND created_at >= datetime('now', '-30 days', 'localtime')
    """)
    month_count, month_sec = cursor.fetchone()

    # এই বছর
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(duration), 0) FROM videos 
        WHERE status = 'success' AND strftime('%Y', created_at) = strftime('%Y', 'now', 'localtime')
    """)
    year_count, year_sec = cursor.fetchone()

    # সর্বমোট
    cursor.execute("""
        SELECT COUNT(*), COALESCE(SUM(duration), 0) FROM videos 
        WHERE status = 'success'
    """)
    total_count, total_sec = cursor.fetchone()

    # সর্বশেষ তৈরি ভিডিও
    cursor.execute("""
        SELECT id, fact, video_path, duration, created_at 
        FROM videos WHERE status = 'success' 
        ORDER BY id DESC LIMIT 1
    """)
    last_row = cursor.fetchone()

    conn.close()

    print("\n" + "=" * 60)
    print(" 📊 অটো ভিডিও জেনারেটর — স্ট্যাটাস ও হিসাব বিবরণী")
    print("=" * 60)
    print(f" • আজকের মোট ভিডিও  : {today_count:>4} টি  ({round(today_sec / 60, 1):>5} মিনিট) [দৈনিক লিমিট: {DAILY_LIMIT}]")
    print(f" • এই সপ্তাহে (৭ দিন) : {week_count:>4} টি  ({round(week_sec / 60, 1):>5} মিনিট)")
    print(f" • এই মাসে (৩০ দিন)  : {month_count:>4} টি  ({round(month_sec / 60, 1):>5} মিনিট)")
    print(f" • এই বছরে           : {year_count:>4} টি  ({round(year_sec / 60, 1):>5} মিনিট)")
    print(f" • সর্বমোট তৈরি       : {total_count:>4} টি  ({round(total_sec / 60, 1):>5} মিনিট)")
    print("-" * 60)

    if last_row:
        lid, lfact, lpath, ldur, ltime = last_row
        print(f" 🎬 সর্বশেষ ভিডিও (#{lid}) : {lpath}")
        print(f" ⏱️  সময়কাল            : {ldur:.1f}s | {ltime}")
        print(f" 📝 ফ্যাক্ট             : {lfact[:60]}..." if len(lfact) > 60 else f" 📝 ফ্যাক্ট             : {lfact}")
    else:
        print(" কোনো ভিডিও এখনও ডাটাবেজে তৈরি হয়নি।")
    print("=" * 60 + "\n")


# ==================== ইমেজ জেনারেশন ====================
def get_best_font(size, is_bengali=False):
    """সিস্টেম থেকে সেরা ফন্ট খুঁজে লোড করে, না থাকলে ডিফল্ট লোড করে"""
    candidates = BENGALI_FONT_CANDIDATES if is_bengali else SYSTEM_FONT_CANDIDATES
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    try:
        return ImageFont.load_default()
    except Exception:
        return None


def interpolate_color(c1, c2, factor):
    """দুটি RGB কালারের মাঝে রৈখিক ইন্টারপোলেশন করে"""
    return (
        int(c1[0] + (c2[0] - c1[0]) * factor),
        int(c1[1] + (c2[1] - c1[1]) * factor),
        int(c1[2] + (c2[2] - c1[2]) * factor),
    )


def create_gradient_image(fact, output_image_path):
    """
    ১০৮০ x ১৯২০ রেজোলিউশনের ৯:১৬ চমৎকার গ্রেডিয়েন্ট পোস্টার ইমেজ তৈরি করে।
    এতে আছে আকর্ষণীয় হেডার ব্যাজ, টেক্সট র‍্যাপ, ড্রপ শ্যাডো এবং ব্র্যান্ডিং ওয়াটারমার্ক।
    """
    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    # র‍্যান্ডম গ্রেডিয়েন্ট প্যালেট নির্বাচন
    top_c, mid_c, bot_c = random.choice(GRADIENT_PALETTES)

    # মসৃণ ৩-স্টেজ গ্রেডিয়েন্ট তৈরি
    half = HEIGHT // 2
    for y in range(HEIGHT):
        if y < half:
            factor = y / half
            color = interpolate_color(top_c, mid_c, factor)
        else:
            factor = (y - half) / (HEIGHT - half)
            color = interpolate_color(mid_c, bot_c, factor)
        draw.line([(0, y), (WIDTH, y)], fill=color)

    # বাংলা বর্ণমালা আছে কি না চেক
    is_bengali = any('\u0980' <= char <= '\u09FF' for char in fact)

    # ফন্ট লোড করা
    badge_font = get_best_font(38, is_bengali)
    fact_font = get_best_font(58, is_bengali)
    footer_font = get_best_font(30, is_bengali)

    # ১. টপ ব্যাজ ("✨ DID YOU KNOW? ✨" বা বাংলা)
    badge_text = "✨ জানতেন কি? ✨" if is_bengali else "✨ DID YOU KNOW? ✨"
    badge_y = 300
    badge_box = draw.textbbox((0, 0), badge_text, font=badge_font)
    badge_w = badge_box[2] - badge_box[0]
    badge_h = badge_box[3] - badge_box[1]
    badge_x = (WIDTH - badge_w) // 2

    # ব্যাজের ব্যাকগ্রাউন্ড পিল
    padding_x = 40
    padding_y = 16
    pill_rect = [
        badge_x - padding_x,
        badge_y - padding_y,
        badge_x + badge_w + padding_x,
        badge_y + badge_h + padding_y,
    ]
    draw.rounded_rectangle(pill_rect, radius=30, fill=(255, 255, 255, 40), outline=(255, 255, 255, 180), width=2)
    draw.text((badge_x, badge_y), badge_text, font=badge_font, fill=(254, 240, 138))  # নরম গোল্ডেন কালার

    # ২. মাঝখানের ফ্যাক্ট টেক্সট (অটো-র‍্যাপ এবং কেন্দ্রবিন্দু নির্ধারণ)
    wrap_width = 24 if is_bengali else 26
    lines = textwrap.wrap(fact, width=wrap_width)

    # লাইনের মোট উচ্চতা মাপা
    line_spacing = 26
    sample_bbox = draw.textbbox((0, 0), "Ag", font=fact_font)
    single_line_h = sample_bbox[3] - sample_bbox[1]
    total_text_h = len(lines) * single_line_h + (len(lines) - 1) * line_spacing

    start_y = (HEIGHT - total_text_h) // 2

    # টেক্সট ড্রপ শ্যাডো সহ আঁকা
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=fact_font)
        lw = bbox[2] - bbox[0]
        lx = (WIDTH - lw) // 2
        ly = start_y + i * (single_line_h + line_spacing)

        # ড্রপ শ্যাডো
        draw.text((lx + 4, ly + 4), line, font=fact_font, fill=(0, 0, 0, 220))
        # মূল টেক্সট
        draw.text((lx, ly), line, font=fact_font, fill=(255, 255, 255))

    # ৩. অ্যাকসেন্ট ডেকোরেশন লাইন
    decor_y1 = start_y - 60
    decor_y2 = start_y + total_text_h + 60
    draw.line([(WIDTH // 2 - 80, decor_y1), (WIDTH // 2 + 80, decor_y1)], fill=(255, 255, 255, 120), width=3)
    draw.line([(WIDTH // 2 - 80, decor_y2), (WIDTH // 2 + 80, decor_y2)], fill=(255, 255, 255, 120), width=3)

    # ৪. ফুটার ব্র্যান্ডিং ওয়াটারমার্ক
    footer_text = "AUTO VIDEO GENERATOR • DAILY FACTS"
    fbox = draw.textbbox((0, 0), footer_text, font=footer_font)
    fw = fbox[2] - fbox[0]
    fx = (WIDTH - fw) // 2
    fy = HEIGHT - 220
    draw.text((fx + 2, fy + 2), footer_text, font=footer_font, fill=(0, 0, 0, 160))
    draw.text((fx, fy), footer_text, font=footer_font, fill=(203, 213, 225, 220))

    img.save(output_image_path, "PNG", quality=95)
    return output_image_path


# ==================== অডিও জেনারেশন (gTTS + অফলাইন ব্যাকআপ) ====================
def generate_audio(text, output_audio_path, lang=LANG):
    """
    gTTS ব্যবহার করে টেক্সট থেকে স্পিচ অডিও (MP3) তৈরি করে।
    যদি ইন্টারনেট সংযোগ বিঘ্নিত হয়, তবে অফলাইনে সিন্থেটিক অডিও ট্র্যাক তৈরি করে যাতে প্রসেস না থামে।
    """
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output_audio_path)
        return output_audio_path
    except Exception as e:
        print(f"⚠️ [সতর্কবার্তা] gTTS অনলাইন সংযোগ ব্যর্থ ({e}), অফলাইন ব্যাকআপ অডিও তৈরি হচ্ছে...")
        # আনুমানিক শব্দের সংখ্যার ভিত্তিতে সময়কাল নির্ধারণ
        words = len(text.split())
        est_duration = max(3.0, round(words * 0.45, 1))

        # FFmpeg দিয়ে স্বয়ংক্রিয় অফলাইন অডিও তৈরি
        offline_cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"sine=frequency=440:beep_factor=4:duration={est_duration}",
            "-af", "volume=0.2",
            "-c:a", "libmp3lame", "-b:a", "128k",
            output_audio_path
        ]
        subprocess.run(offline_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return output_audio_path


def get_audio_duration(audio_path):
    """FFprobe দিয়ে অডিও ফাইলের সঠিক সময়কাল বের করে"""
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audio_path
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(result.stdout.strip())
    except Exception:
        return 4.0


# ==================== ভিডিও রেন্ডারিং (FFmpeg) ====================
def render_video(image_path, audio_path, output_video_path):
    """
    FFmpeg দিয়ে ইমেজ এবং অডিও একত্রিত করে উচ্চমানের ৯:১৬ MP4 ভিডিও তৈরি করে।
    """
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", image_path,
        "-i", audio_path,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        output_video_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True)
    return output_video_path


# ==================== একক ভিডিও তৈরির পাইপলাইন ====================
def create_single_video(index=None):
    """
    একটি সম্পূর্ণ ভিডিও তৈরি করার ওয়ার্কফ্লো:
    ফ্যাক্ট বাছাই -> ইমেজ তৈরি -> ভয়েসওভার -> ভিডিও রেন্ডার -> ডাটাবেজ সংরক্ষণ
    """
    # আজ লিমিট পার হয়েছে কি না চেক
    today_count = get_today_count()
    if today_count >= DAILY_LIMIT:
        print(f"🛑 দৈনিক লিমিট ({DAILY_LIMIT} টি) পূর্ণ হয়েছে! আজ আর নতুন ভিডিও তৈরি করা হবে না।")
        return None

    # ফোল্ডার নিশ্চিত করা
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, "temp"), exist_ok=True)

    # ফ্যাক্ট নির্বাচন
    fact = random.choice(FACTS)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    rand_id = random.randint(100, 999)
    prefix = f"fact_{timestamp}_{rand_id}"

    temp_img = os.path.join(OUT_DIR, "temp", f"{prefix}.png")
    temp_audio = os.path.join(OUT_DIR, "temp", f"{prefix}.mp3")
    output_video = os.path.join(OUT_DIR, f"{prefix}.mp4")

    print(f"\n🎬 [ভিডিও তৈরি শুরু #{index or today_count + 1}]")
    print(f"   📝 ফ্যাক্ট: \"{fact}\"")

    try:
        # ১. ইমেজ তৈরি
        print("   🎨 ১/৩ গ্রেডিয়েন্ট পোস্টার ইমেজ তৈরি হচ্ছে...")
        create_gradient_image(fact, temp_img)

        # ২. অডিও তৈরি
        print(f"   🎙️ ২/৩ ভয়েসওভার অডিও তৈরি হচ্ছে (ভাষা: {LANG})...")
        generate_audio(fact, temp_audio, lang=LANG)
        duration = get_audio_duration(temp_audio)

        # ৩. ভিডিও রেন্ডারিং
        print(f"   ⚙️ ৩/৩ FFmpeg দিয়ে ৯:১৬ MP4 রেন্ডার হচ্ছে (সময়কাল: {duration:.1f}s)...")
        render_video(temp_img, temp_audio, output_video)

        # ৪. ডাটাবেজে রেকর্ড
        db_id = record_video(fact, output_video, duration, status="success")
        print(f"   ✅ সফল! সেভ হয়েছে: {output_video} (ID: #{db_id})")

        # টেম্প ফাইল ক্লিনআপ
        if os.path.exists(temp_img):
            os.remove(temp_img)
        if os.path.exists(temp_audio):
            os.remove(temp_audio)

        return output_video

    except Exception as e:
        print(f"   ❌ ভিডিও তৈরিতে ত্রুটি: {e}")
        # ব্যর্থ হলেও ডাটাবেজে ট্র্যাক রাখা
        record_video(fact, "", 0.0, status=f"failed: {str(e)[:100]}")
        raise e


# ==================== মেইন কন্ট্রোলার / CLI ====================
def main():
    parser = argparse.ArgumentParser(description="অটো ভিডিও জেনারেটর — স্বয়ংক্রিয় শর্টস প্রোটোটাইপ")
    parser.add_argument("--test", type=int, default=None, help="নির্দিষ্ট সংখ্যক ভিডিও বানিয়ে থামবে (উদা: --test 3)")
    parser.add_argument("--stats", action="store_true", help="ডাটাবেজ থেকে তৈরি ভিডিওর পরিসংখ্যান দেখাবে")
    args = parser.parse_args()

    # ডাটাবেজ নিশ্চিত করা
    init_db()

    # ১. শুধুমাত্র স্ট্যাটাস প্রদর্শন
    if args.stats:
        print_stats()
        return

    # ২. টেস্ট মোড (যেমন: --test 3)
    if args.test is not None:
        count_to_make = args.test
        print(f"\n🧪 টেস্ট মোড শুরু হচ্ছে: {count_to_make} টি ভিডিও তৈরি করা হবে...")
        successful = 0
        for i in range(1, count_to_make + 1):
            try:
                result = create_single_video(index=i)
                if result:
                    successful += 1
            except Exception as e:
                print(f"⚠️ ভিডিও #{i} ব্যর্থ হয়েছে, তবে সিস্টেম অব্যাহত থাকবে: {e}")

            if i < count_to_make:
                print(f"⏳ বিরতি ({PAUSE_SECONDS}s)...")
                time.sleep(PAUSE_SECONDS)

        print(f"\n🎉 টেস্ট সম্পন্ন! {successful}/{count_to_make} টি ভিডিও সফলভাবে তৈরি হয়েছে।")
        print_stats()
        return

    # ৩. অবিরাম মোড (Continuous Loop)
    print("\n🚀 অটো ভিডিও জেনারেটর চালু হয়েছে (অবিরাম লুপ)!")
    print(f"   • বিরতি: {PAUSE_SECONDS} সেকেন্ড | দৈনিক সীমা: {DAILY_LIMIT}")
    print("   • থামাতে টার্মিনালে চাপুন: Ctrl + C\n")

    iteration = 0
    try:
        while True:
            iteration += 1
            try:
                create_single_video(index=iteration)
            except Exception as e:
                print(f"⚠️ এরর হয়েছে, ৫ সেকেন্ড পর পুনরায় চেষ্টা করা হবে: {e}")

            print(f"⏳ পরবর্তী ভিডিওর জন্য অপেক্ষা ({PAUSE_SECONDS}s)...")
            time.sleep(PAUSE_SECONDS)

    except KeyboardInterrupt:
        print("\n\n🛑 ব্যবহারকারীর নির্দেশে অটো ভিডিও জেনারেটর থামানো হয়েছে (Ctrl+C)।")
        print_stats()


if __name__ == "__main__":
    main()
