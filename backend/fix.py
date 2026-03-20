import re

with open("src/main/kotlin/com/cardwise/group/api/GroupController.kt", "r", encoding="utf-8") as f:
    code = f.read()

# Regex to find un-implemented methods that were partially written but fail to compile
unimplemented_methods = [
    "getGroupDetail", "updateGroup", "deleteGroup", "cancelInvitation",
    "createGroupPayment", "updateGroupPayment", "deleteGroupPayment",
    "removeMember", "leaveGroup", "transferOwnership", "getGroupTags", "createGroupTag"
]

for m in unimplemented_methods:
    regex = rf"(\bfun\s+{m}\([\s\S]*?\)\s*:\s*ApiResponse<[^>]+>)\s*\{{[\s\S]*?groupUseCase\.{m}[\s\S]*?\n\s*\}}"
    code = re.sub(regex, r'\1 = TODO("Not implemented yet")', code, flags=re.MULTILINE)

with open("src/main/kotlin/com/cardwise/group/api/GroupController.kt", "w", encoding="utf-8") as f:
    f.write(code)

print("done")
