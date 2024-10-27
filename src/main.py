# checked 1
def check_(text: str) -> bool:
    if len(text) == 0:
        return False
    if '(' in text or '(' in text and ')' in text:
         return True
    if re.match('[^\n\s{4,}\t]*
, text, flags=re.MULTILINE):
         return True
    return False
