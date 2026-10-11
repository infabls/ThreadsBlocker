import asyncio
import os
import sys
from threads_api.src.threads_api import ThreadsAPI


async def block_users_from_file(filepath: str):
    username = os.environ.get("THREADS_USERNAME")
    password = os.environ.get("THREADS_PASSWORD")

    if not username or not password:
        print("Задайте переменные окружения THREADS_USERNAME и THREADS_PASSWORD")
        sys.exit(1)

    with open(filepath, encoding="utf-8") as f:
        targets = [line.strip() for line in f if line.strip()]

    if not targets:
        print("Список пуст.")
        return

    api = ThreadsAPI()
    ok = await api.login(username=username, password=password, cached_token_path=".token")
    if not ok:
        print("Ошибка входа.")
        await api.close_gracefully()
        sys.exit(1)

    print(f"Вошли как {username}. Блокируем {len(targets)} аккаунт(ов)...\n")

    for name in targets:
        try:
            user_id = await api.get_user_id_from_username(name)
            if not user_id:
                print(f"[ПРОПУСК]  {name} — пользователь не найден")
                continue
            resp = await api.block_user(user_id)
            blocked = resp.get("friendship_status", {}).get("blocking", False)
            status = "заблокирован" if blocked else "не удалось заблокировать"
            print(f"[{'OK' if blocked else 'FAIL'}]     {name} — {status}")
        except Exception as e:
            print(f"[ERROR]   {name} — {e}")

    await api.close_gracefully()
    print("\nГотово.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: uv run block_users.py <путь_к_файлу.txt>")
        sys.exit(1)

    asyncio.run(block_users_from_file(sys.argv[1]))
