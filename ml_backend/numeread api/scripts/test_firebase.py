import sys
from pathlib import Path

sys.path.append(
    str(Path(__file__).resolve().parent.parent)
)

from data.firebase_service import FirebaseService


def main():
    print("====================================")
    print("NumeRead Firebase Connection Test")
    print("====================================")

    firebase = FirebaseService()

    student_id = input("Enter a student ID: ").strip()

    if not student_id:
        print("❌ No student ID entered.")
        return

    print("\nSearching Firebase...")

    student = firebase.get_student(student_id)

    if student is None:
        print("❌ Student not found.")
        print("Check that the ID matches a document in:")
        print("students")
        return

    print("\n✅ Student found!")
    print("------------------------------------")

    for key, value in student.items():
        print(f"{key}: {value}")

    print("------------------------------------")
    print("✅ Python → Firebase is working!")


if __name__ == "__main__":
    main()