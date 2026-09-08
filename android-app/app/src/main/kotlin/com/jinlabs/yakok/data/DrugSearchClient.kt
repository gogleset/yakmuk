package com.jinlabs.yakok.data

import com.jinlabs.yakok.BuildConfig
import com.jinlabs.yakok.core.constants.Limits
import com.jinlabs.yakok.core.copy.Errors
import com.jinlabs.yakok.core.med.DrugSearchItem
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

@Singleton
class DrugSearchClient @Inject constructor() {
    private val json = Json { ignoreUnknownKeys = true }

    val isConfigured: Boolean get() = BuildConfig.DATA_GO_KR_SERVICE_KEY.isNotBlank()

    suspend fun search(query: String): List<DrugSearchItem> = withContext(Dispatchers.IO) {
        val q = query.trim()
        if (q.length < Limits.DrugSearchMinQueryLength) return@withContext emptyList()
        val key = BuildConfig.DATA_GO_KR_SERVICE_KEY.trim()
        if (key.isEmpty()) throw IllegalStateException(Errors.Med.SearchFailed)

        val params = "pageNo=1&numOfRows=20&itemName=${URLEncoder.encode(q, "UTF-8")}&type=json"
        val url = URL("$EASY_DRUG_URL?serviceKey=$key&$params")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 12_000
            readTimeout = 12_000
            requestMethod = "GET"
        }
        val text = try {
            val code = conn.responseCode
            val body = (if (code in 200..299) conn.inputStream else conn.errorStream)
                ?.bufferedReader()?.readText().orEmpty()
            if (code == 403 || body.contains("forbidden", ignoreCase = true)) {
                throw IllegalStateException(Errors.Med.SearchForbidden)
            }
            if (code !in 200..299) throw IllegalStateException("${Errors.Med.SearchFailed} ($code)")
            body
        } catch (e: IllegalStateException) {
            throw e
        } catch (_: Exception) {
            throw IllegalStateException(Errors.Med.SearchNetwork)
        } finally {
            conn.disconnect()
        }

        val root = runCatching { json.parseToJsonElement(text).jsonObject }.getOrElse {
            throw IllegalStateException(Errors.Med.SearchParse)
        }
        val header = root["header"]?.jsonObject
        val resultCode = header?.get("resultCode")?.jsonPrimitive?.contentOrNull
        if (resultCode != null && resultCode != "00") {
            throw IllegalStateException(header["resultMsg"]?.jsonPrimitive?.contentOrNull ?: Errors.Med.SearchFailed)
        }
        val itemsEl = root["body"]?.jsonObject?.get("items")
        val raw: List<JsonObject> = when (itemsEl) {
            is JsonArray -> itemsEl.mapNotNull { it as? JsonObject }
            is JsonObject -> listOf(itemsEl)
            else -> emptyList()
        }
        raw.mapNotNull { row ->
            val name = row.str("itemName") ?: return@mapNotNull null
            val seq = row.str("itemSeq") ?: return@mapNotNull null
            DrugSearchItem(
                itemSeq = seq,
                itemName = name,
                entpName = row.str("entpName") ?: "제조사 미상",
                efficacy = clean(row.str("efcyQesitm")),
                useMethod = clean(row.str("useMethodQesitm")),
                storage = clean(row.str("depositMethodQesitm")),
                warning = clean(row.str("atpnWarnQesitm")),
            )
        }
    }

    private fun JsonObject.str(key: String): String? =
        get(key)?.jsonPrimitive?.contentOrNull?.trim()?.takeIf { it.isNotEmpty() }

    private fun clean(value: String?): String? {
        if (value.isNullOrBlank()) return null
        return value.replace(Regex("<[^>]+>"), " ").replace(Regex("\\s+"), " ").trim().ifEmpty { null }
    }

    companion object {
        private const val EASY_DRUG_URL =
            "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"
    }
}
