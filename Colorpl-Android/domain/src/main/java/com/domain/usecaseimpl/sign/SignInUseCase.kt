package com.domain.usecaseimpl.sign

import com.data.repository.SignRepository
import com.data.repository.TokenRepository
import com.data.util.ApiResult
import com.domain.mapper.toParam
import com.domain.model.User
import com.domain.util.RepoResult
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SignInUseCase @Inject constructor(
    private val tokenRepository: TokenRepository,
    private val signRepository: SignRepository
) {

    suspend fun signIn(user: User) = flow {
        signRepository.signIn(user.toParam()).collect { result ->
            when (result) {
                is ApiResult.Success -> {
                    val data = RepoResult.success(result.data)
                    tokenRepository.setAccessToken(data.data.accessToken)
                    emit(RepoResult.success(result.data))
                }

                is ApiResult.Error -> {
                    emit(RepoResult.error(result.exception))
                }
            }
        }

    }

}