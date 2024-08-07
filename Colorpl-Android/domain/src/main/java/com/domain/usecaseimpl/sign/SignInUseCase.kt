package com.domain.usecaseimpl.sign

import com.data.model.request.RequestGoogleSignIn
import com.data.repository.SignRepository
import com.data.repository.TokenRepository
import com.data.util.ApiResult
import com.domain.mapper.toSignInParam
import com.domain.model.Member
import com.domain.util.DomainResult
import kotlinx.coroutines.flow.flow
import timber.log.Timber
import javax.inject.Inject

class SignInUseCase @Inject constructor(
    private val tokenRepository: TokenRepository,
    private val signRepository: SignRepository
) {

    suspend fun signIn(member: Member) = flow {
        signRepository.signIn(member.toSignInParam()).collect { result ->
            Timber.d("로그인 확인 $result")
            when (result) {
                is ApiResult.Success -> {
                    val data = DomainResult.success(result.data)
                    tokenRepository.setAccessToken(data.data.accessToken)
                    emit(DomainResult.success(result.data))
                }

                is ApiResult.Error -> {
                    emit(DomainResult.error(result.exception))
                }
            }
        }
    }

    suspend fun googleSignIn(idToken : String) = flow{
        signRepository.googleSignIn(RequestGoogleSignIn(idToken)).collect { result ->
            Timber.d("구글 로그인 확인 $result")
            when (result) {
                is ApiResult.Success -> {
                    val data = DomainResult.success(result.data)
                    tokenRepository.setAccessToken(data.data.accessToken)
                    emit(DomainResult.success(result.data))
                }

                is ApiResult.Error -> {
                    emit(DomainResult.error(result.exception))
                }
            }
        }
    }

}